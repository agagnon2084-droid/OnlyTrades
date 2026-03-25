import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;
    const session = await auth();

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true, name: true, username: true, displayName: true, avatar: true, bannerUrl: true,
        tagline: true, bio: true, location: true, website: true, skills: true, interests: true,
        tradeStyle: true, isVerified: true, isPrivate: true, rating: true, tradeCount: true,
        createdAt: true, lastActiveAt: true,
        _count: { select: { followers: true, following: true, posts: true } },
        posts: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 9,
          include: { user: { select: { id: true, name: true, avatar: true, username: true } } },
        },
        receivedReviews: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { reviewer: { select: { id: true, name: true, avatar: true, username: true } } },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Check if current user follows this user
    let isFollowing = false;
    if (session?.user?.id && session.user.id !== user.id) {
      const follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: session.user.id, followingId: user.id } },
      });
      isFollowing = !!follow;
    }

    return NextResponse.json({ user, isFollowing });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
