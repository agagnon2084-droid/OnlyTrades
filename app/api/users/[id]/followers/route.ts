import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const followers = await prisma.follow.findMany({
      where: { followingId: id },
      include: { follower: { select: { id: true, name: true, username: true, avatar: true, tagline: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ followers: followers.map(f => f.follower) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
