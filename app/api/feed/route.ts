import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 12;

    // Get IDs of followed users
    const follows = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    });
    const followingIds = follows.map(f => f.followingId);

    if (followingIds.length === 0) {
      return NextResponse.json({ posts: [], total: 0, page, pages: 0, hasFollows: false });
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { userId: { in: followingIds }, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { id: true, name: true, avatar: true, username: true } } },
      }),
      prisma.post.count({ where: { userId: { in: followingIds }, status: "ACTIVE" } }),
    ]);

    return NextResponse.json({ posts, total, page, pages: Math.ceil(total / limit), hasFollows: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
