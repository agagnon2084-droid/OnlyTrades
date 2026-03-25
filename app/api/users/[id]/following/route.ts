import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const following = await prisma.follow.findMany({
      where: { followerId: id },
      include: { following: { select: { id: true, name: true, username: true, avatar: true, tagline: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ following: following.map(f => f.following) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
