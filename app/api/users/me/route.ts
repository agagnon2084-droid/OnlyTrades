import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkAndAwardProfileComplete } from "@/lib/badges";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      badges: true,
      _count: { select: { posts: true, followers: true, following: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const allowedFields = [
    "displayName", "username", "tagline", "location", "bio",
    "avatar", "bannerUrl", "website", "skills", "interests",
    "tradeStyle", "isPrivate", "hasCompletedOnboarding",
  ];

  const updateData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  // Validate username if provided
  if (updateData.username) {
    const username = (updateData.username as string).toLowerCase().trim();
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json({ error: "Username must be 3-20 characters, letters/numbers/underscores only" }, { status: 400 });
    }
    const existing = await prisma.user.findFirst({
      where: { username, NOT: { id: session.user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }
    updateData.username = username;
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    // Check for profile complete badge
    await checkAndAwardProfileComplete(session.user.id);

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Failed to update user:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
