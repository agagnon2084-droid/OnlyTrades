import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { tradeRequestId, rating, comment } = await req.json();
    if (!tradeRequestId || !rating) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }

    const trade = await prisma.tradeRequest.findUnique({ where: { id: tradeRequestId } });
    if (!trade || trade.status !== "COMPLETED") {
      return NextResponse.json({ error: "Trade not found or not completed" }, { status: 404 });
    }

    const revieweeId = trade.fromUserId === session.user.id ? trade.toUserId : trade.fromUserId;
    if (trade.fromUserId !== session.user.id && trade.toUserId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const review = await prisma.review.create({
      data: {
        reviewerId: session.user.id,
        revieweeId,
        tradeRequestId,
        rating,
        comment,
      },
    });

    // Recalculate average rating for reviewee
    const reviews = await prisma.review.findMany({
      where: { revieweeId },
      select: { rating: true },
    });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await prisma.user.update({
      where: { id: revieweeId },
      data: { rating: Math.round(avg * 10) / 10 },
    });

    await prisma.notification.create({
      data: {
        userId: revieweeId,
        type: "NEW_REVIEW",
        message: `You received a new ${rating}-star review!`,
        linkTo: `/profile/${revieweeId}`,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
