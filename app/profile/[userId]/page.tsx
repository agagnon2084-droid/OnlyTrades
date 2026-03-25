export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Avatar from "@/components/ui/Avatar";
import StarRating from "@/components/ui/StarRating";
import PostCard from "@/components/PostCard";
import { formatDate, timeAgo } from "@/lib/utils";
import ReviewModal from "./ReviewModal";

async function getUser(id: string) {
  return prisma.user.findUnique({
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
        take: 9,
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
      receivedReviews: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          reviewer: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
  });
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ review?: string }>;
}) {
  const { userId } = await params;
  const { review: reviewTradeId } = await searchParams;
  const [user, session] = await Promise.all([getUser(userId), auth()]);

  if (!user) notFound();

  const isOwnProfile = session?.user?.id === userId;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Review modal if redirected from trade */}
      {reviewTradeId && session && (
        <ReviewModal tradeRequestId={reviewTradeId} revieweeId={userId} revieweeName={user.name || "this user"} />
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left — Profile card */}
        <div className="flex flex-col gap-5">
          <div className="card p-6 text-center">
            <Avatar src={user.avatar} name={user.name || "User"} size="xl" className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[var(--foreground)]">{user.name}</h1>
            {user.location && (
              <p className="text-sm text-[var(--muted-foreground)] mt-1">📍 {user.location}</p>
            )}
            <div className="flex justify-center mt-3">
              <StarRating value={user.rating} size="md" />
            </div>
            <p className="text-lg font-bold text-[var(--foreground)] mt-1">
              {user.rating > 0 ? user.rating.toFixed(1) : "No ratings yet"}
            </p>
            <div className="flex justify-around mt-4 pt-4 border-t border-[var(--border)]">
              <div>
                <div className="text-2xl font-bold text-[var(--foreground)]">{user.tradeCount}</div>
                <div className="text-xs text-[var(--muted-foreground)]">Trades</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--foreground)]">{user.posts.length}</div>
                <div className="text-xs text-[var(--muted-foreground)]">Active Posts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--foreground)]">{user.receivedReviews.length}</div>
                <div className="text-xs text-[var(--muted-foreground)]">Reviews</div>
              </div>
            </div>
            {isOwnProfile && (
              <Link href="/settings" className="block mt-4">
                <button className="w-full text-sm px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors">
                  Edit Profile
                </button>
              </Link>
            )}
          </div>

          {user.bio && (
            <div className="card p-5">
              <h3 className="font-semibold text-[var(--foreground)] mb-2">About</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{user.bio}</p>
            </div>
          )}

          <div className="card p-5">
            <p className="text-xs text-[var(--muted-foreground)]">
              Member since {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* Right — Posts & Reviews */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Active posts */}
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
              Active Trades
              {user.posts.length > 0 && (
                <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">
                  ({user.posts.length})
                </span>
              )}
            </h2>
            {user.posts.length === 0 ? (
              <div className="card p-8 text-center text-[var(--muted-foreground)] text-sm">
                {isOwnProfile ? (
                  <span>
                    You have no active posts.{" "}
                    <Link href="/post/new" className="text-[var(--primary)] hover:underline">
                      Create one!
                    </Link>
                  </span>
                ) : "No active posts."}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {user.posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
              Reviews
              {user.receivedReviews.length > 0 && (
                <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">
                  ({user.receivedReviews.length})
                </span>
              )}
            </h2>
            {user.receivedReviews.length === 0 ? (
              <div className="card p-8 text-center text-[var(--muted-foreground)] text-sm">
                No reviews yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {user.receivedReviews.map((review) => (
                  <div key={review.id} className="card p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={review.reviewer.avatar} name={review.reviewer.name || "User"} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-[var(--foreground)]">{review.reviewer.name}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{timeAgo(review.createdAt)}</p>
                        </div>
                      </div>
                      <StarRating value={review.rating} size="sm" />
                    </div>
                    {review.comment && (
                      <p className="text-sm text-[var(--muted-foreground)] mt-3 leading-relaxed">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
