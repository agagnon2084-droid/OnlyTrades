import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: followingId } = await params;
    if (session.user.id === followingId) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

    const follow = await prisma.follow.upsert({
      where: { followerId_followingId: { followerId: session.user.id, followingId } },
      create: { followerId: session.user.id, followingId },
      update: {},
    });

    await prisma.notification.create({
      data: {
        userId: followingId,
        type: "NEW_FOLLOWER",
        message: `${session.user.name || "Someone"} started following you`,
        linkTo: `/u/${session.user.id}`,
      },
    });

    return NextResponse.json({ follow });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: followingId } = await params;

    await prisma.follow.deleteMany({
      where: { followerId: session.user.id, followingId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
