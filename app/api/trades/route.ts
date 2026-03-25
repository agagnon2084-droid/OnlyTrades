import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const direction = searchParams.get("direction"); // "sent" | "received" | null (both)

    const where =
      direction === "sent"
        ? { fromUserId: session.user.id }
        : direction === "received"
        ? { toUserId: session.user.id }
        : { OR: [{ fromUserId: session.user.id }, { toUserId: session.user.id }] };

    const trades = await prisma.tradeRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        fromUser: { select: { id: true, name: true, avatar: true } },
        toUser: { select: { id: true, name: true, avatar: true } },
        offeredPost: { select: { id: true, title: true, images: true, category: true } },
        requestedPost: { select: { id: true, title: true, images: true, category: true } },
      },
    });

    return NextResponse.json({ trades });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { offeredPostId, requestedPostId, message } = await req.json();
    if (!offeredPostId || !requestedPostId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const [offeredPost, requestedPost] = await Promise.all([
      prisma.post.findUnique({ where: { id: offeredPostId } }),
      prisma.post.findUnique({ where: { id: requestedPostId }, include: { user: true } }),
    ]);

    if (!offeredPost || !requestedPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (offeredPost.userId !== session.user.id) {
      return NextResponse.json({ error: "Not your post" }, { status: 403 });
    }
    if (requestedPost.userId === session.user.id) {
      return NextResponse.json({ error: "Cannot trade with yourself" }, { status: 400 });
    }

    const trade = await prisma.tradeRequest.create({
      data: {
        fromUserId: session.user.id,
        toUserId: requestedPost.userId,
        offeredPostId,
        requestedPostId,
        message,
      },
    });

    // Create notification for recipient
    await prisma.notification.create({
      data: {
        userId: requestedPost.userId,
        type: "TRADE_REQUEST",
        message: `You have a new trade request for "${requestedPost.title}"`,
        linkTo: `/dashboard`,
      },
    });

    return NextResponse.json({ trade }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
