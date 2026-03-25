import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rankMatches } from "@/lib/matching";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Get all active posts for matching
    const allPosts = await prisma.post.findMany({
      where: { status: "ACTIVE" },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    if (!session?.user?.id) {
      // Return paginated active posts for unauthenticated users
      const start = (page - 1) * limit;
      const paginated = allPosts.slice(start, start + limit);
      return NextResponse.json({
        posts: paginated,
        total: allPosts.length,
        page,
        pages: Math.ceil(allPosts.length / limit),
        isMatched: false,
      });
    }

    // Get user's own posts to extract seek keywords
    const userPosts = await prisma.post.findMany({
      where: { userId: session.user.id, status: "ACTIVE" },
      select: { id: true, offerKeywords: true, seekKeywords: true },
    });

    if (userPosts.length === 0) {
      // No posts yet — just return recent active posts
      const start = (page - 1) * limit;
      const paginated = allPosts.slice(start, start + limit);
      return NextResponse.json({
        posts: paginated,
        total: allPosts.length,
        page,
        pages: Math.ceil(allPosts.length / limit),
        isMatched: false,
      });
    }

    // Aggregate all user's seek keywords
    const userSeekKeywords = [...new Set(userPosts.flatMap((p) => p.seekKeywords))];
    const userOfferKeywords = [...new Set(userPosts.flatMap((p) => p.offerKeywords))];

    // Create a virtual "user profile" post for matching
    const virtualUserPost = {
      id: "virtual",
      offerKeywords: userOfferKeywords,
      seekKeywords: userSeekKeywords,
    };

    const candidates = allPosts
      .filter((p) => p.userId !== session.user.id)
      .map((p) => ({ id: p.id, offerKeywords: p.offerKeywords, seekKeywords: p.seekKeywords }));

    const ranked = rankMatches(virtualUserPost, candidates);

    // Merge scores into post objects
    const rankedMap = new Map(ranked.map((r) => [r.postId, r]));
    const scoredPosts = allPosts
      .filter((p) => p.userId !== session.user.id)
      .map((p) => ({
        ...p,
        matchScore: rankedMap.get(p.id)?.score ?? 0,
        mutual: rankedMap.get(p.id)?.mutual ?? false,
      }))
      .sort((a, b) => b.matchScore - a.matchScore || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const start = (page - 1) * limit;
    const paginated = scoredPosts.slice(start, start + limit);

    return NextResponse.json({
      posts: paginated,
      total: scoredPosts.length,
      page,
      pages: Math.ceil(scoredPosts.length / limit),
      isMatched: true,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
