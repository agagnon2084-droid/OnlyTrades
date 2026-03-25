import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        location: true,
        rating: true,
        tradeCount: true,
        createdAt: true,
        posts: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 6,
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        receivedReviews: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { reviewer: { select: { id: true, name: true, avatar: true } } },
        },
      },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (session.user.id !== id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { name, bio, location, avatar, currentPassword, newPassword } = body;

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (avatar !== undefined) updateData.avatar = avatar;

    if (newPassword) {
      if (!currentPassword) return NextResponse.json({ error: "Current password required" }, { status: 400 });
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user?.password) return NextResponse.json({ error: "No password set" }, { status: 400 });
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, avatar: true, bio: true, location: true, email: true },
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
