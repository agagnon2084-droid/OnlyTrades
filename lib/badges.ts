import { prisma } from "@/lib/prisma";
import { BadgeType } from "@prisma/client";

const BADGE_META: Record<BadgeType, { label: string; icon: string; color: string; description: string }> = {
  EMAIL_VERIFIED: { label: "VERIFIED", icon: "✓", color: "var(--accent-static)", description: "Email address verified" },
  PROFILE_COMPLETE: { label: "COMPLETE", icon: "◉", color: "var(--accent-acid)", description: "Profile fully filled out (avatar, bio, location)" },
  FIRST_TRADE: { label: "TRADER", icon: "⇄", color: "var(--accent-acid)", description: "Completed first trade" },
  TRUSTED_TRADER: { label: "TRUSTED", icon: "✓", color: "var(--accent-static)", description: "5+ completed trades" },
  VETERAN: { label: "VETERAN", icon: "★", color: "var(--accent-acid)", description: "25+ completed trades" },
  FAST_RESPONDER: { label: "FAST", icon: "⚡", color: "var(--accent-static)", description: "Responds to messages within 2 hours" },
};

export function getBadgeMeta(type: BadgeType) {
  return BADGE_META[type];
}

export function getAllBadgeMeta() {
  return BADGE_META;
}

export async function awardBadge(userId: string, type: BadgeType): Promise<boolean> {
  try {
    await prisma.userBadge.upsert({
      where: { userId_type: { userId, type } },
      create: { userId, type },
      update: {},
    });
    return true;
  } catch {
    return false;
  }
}

export async function checkAndAwardProfileComplete(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatar: true, bio: true, location: true },
  });
  if (user?.avatar && user?.bio && user?.location) {
    return awardBadge(userId, "PROFILE_COMPLETE");
  }
  return false;
}

export async function checkAndAwardTradebadges(userId: string): Promise<void> {
  const completedCount = await prisma.tradeRequest.count({
    where: {
      status: "COMPLETED",
      OR: [{ fromUserId: userId }, { toUserId: userId }],
    },
  });

  if (completedCount >= 1) {
    await awardBadge(userId, "FIRST_TRADE");
  }
  if (completedCount >= 5) {
    await awardBadge(userId, "TRUSTED_TRADER");
  }
  if (completedCount >= 25) {
    await awardBadge(userId, "VETERAN");
  }
}

export async function getUserBadges(userId: string) {
  const badges = await prisma.userBadge.findMany({
    where: { userId },
    orderBy: { earnedAt: "asc" },
  });
  return badges.map((b) => ({
    ...b,
    meta: BADGE_META[b.type],
  }));
}
