import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username")?.toLowerCase().trim();
  if (!username) return NextResponse.json({ available: false, error: "Required" });

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return NextResponse.json({ available: false, error: "3-20 chars, letters/numbers/underscores only" });
  }

  const session = await auth();
  const existing = await prisma.user.findFirst({
    where: { username, NOT: session?.user?.id ? { id: session.user.id } : undefined },
  });

  return NextResponse.json({ available: !existing });
}
