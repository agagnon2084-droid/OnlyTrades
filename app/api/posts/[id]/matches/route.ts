import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rankMatches } from "@/lib/matching";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sourcePost = await prisma.post.findUnique({ where: { id } });
    if (!sourcePost) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const candidates = await prisma.post.findMany({
      where: { status: "ACTIVE", id: { not: id } },
      select: { id: true, offerKeywords: true, seekKeywords: true },
    });

    const ranked = rankMatches(sourcePost, candidates).slice(0, 20);

    if (ranked.length === 0) return NextResponse.json({ matches: [] });

    const matchedPosts = await prisma.post.findMany({
      where: { id: { in: ranked.map((r) => r.postId) } },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    const withScores = ranked.map((r) => ({
      ...matchedPosts.find((p) => p.id === r.postId),
      matchScore: r.score,
      mutual: r.mutual,
      offerOverlap: r.offerOverlap,
      seekOverlap: r.seekOverlap,
    }));

    return NextResponse.json({ matches: withScores });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
