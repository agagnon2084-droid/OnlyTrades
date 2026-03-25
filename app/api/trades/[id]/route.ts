import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { action } = await req.json(); // accept | decline | cancel | complete

    const trade = await prisma.tradeRequest.findUnique({
      where: { id },
      include: {
        offeredPost: true,
        requestedPost: true,
        fromUser: { select: { id: true, name: true } },
        toUser: { select: { id: true, name: true } },
      },
    });

    if (!trade) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isFrom = trade.fromUserId === session.user.id;
    const isTo = trade.toUserId === session.user.id;

    if (!isFrom && !isTo) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let newStatus: string;
    let notificationUserId: string;
    let notificationMessage: string;
    let notificationType: string;

    if (action === "accept" && isTo && trade.status === "PENDING") {
      newStatus = "ACCEPTED";
      notificationUserId = trade.fromUserId;
      notificationMessage = `Your trade request was accepted!`;
      notificationType = "TRADE_ACCEPTED";
      // Move both posts to PENDING
      await prisma.post.updateMany({
        where: { id: { in: [trade.offeredPostId, trade.requestedPostId] } },
        data: { status: "PENDING" },
      });
    } else if (action === "decline" && isTo && trade.status === "PENDING") {
      newStatus = "DECLINED";
      notificationUserId = trade.fromUserId;
      notificationMessage = `Your trade request was declined.`;
      notificationType = "TRADE_DECLINED";
    } else if (action === "cancel" && isFrom && ["PENDING", "ACCEPTED"].includes(trade.status)) {
      newStatus = "CANCELLED";
      notificationUserId = trade.toUserId;
      notificationMessage = `A trade request was cancelled.`;
      notificationType = "TRADE_CANCELLED";
      // Restore posts to ACTIVE if they were pending
      if (trade.status === "ACCEPTED") {
        await prisma.post.updateMany({
          where: { id: { in: [trade.offeredPostId, trade.requestedPostId] } },
          data: { status: "ACTIVE" },
        });
      }
    } else if (action === "complete" && trade.status === "ACCEPTED") {
      newStatus = "COMPLETED";
      notificationUserId = isFrom ? trade.toUserId : trade.fromUserId;
      notificationMessage = `A trade was marked as completed! Leave a review.`;
      notificationType = "TRADE_COMPLETED";
      // Move both posts to TRADED
      await prisma.post.updateMany({
        where: { id: { in: [trade.offeredPostId, trade.requestedPostId] } },
        data: { status: "TRADED" },
      });
      // Increment trade counts
      await prisma.user.updateMany({
        where: { id: { in: [trade.fromUserId, trade.toUserId] } },
        data: { tradeCount: { increment: 1 } },
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updated = await prisma.tradeRequest.update({
      where: { id },
      data: { status: newStatus as "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED" | "COMPLETED" },
    });

    await prisma.notification.create({
      data: {
        userId: notificationUserId,
        type: notificationType as "TRADE_ACCEPTED" | "TRADE_DECLINED" | "TRADE_CANCELLED" | "TRADE_COMPLETED",
        message: notificationMessage,
        linkTo: `/dashboard`,
      },
    });

    return NextResponse.json({ trade: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
