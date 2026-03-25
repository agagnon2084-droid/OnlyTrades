export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import Avatar from "@/components/ui/Avatar";
import StarRating from "@/components/ui/StarRating";
import PostCard from "@/components/PostCard";
import Badge from "@/components/ui/Badge";
import { timeAgo, formatDate } from "@/lib/utils";
import { getBadgeMeta } from "@/lib/badges";
import FollowButton from "./FollowButton";
import MessageButton from "./MessageButton";

async function getData(username: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/users/username/${username}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth();
  const data = await getData(username);

  if (!data?.user) notFound();
  const { user, isFollowing } = data;
  const isOwn = session?.user?.id === user.id;

  const isOnline = user.lastActiveAt && (Date.now() - new Date(user.lastActiveAt).getTime()) < 10 * 60 * 1000;

  // Generate a deterministic banner pattern from username if no banner
  const bannerGradient = `linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-0">
      {/* ── BANNER ── */}
      <div className="relative h-40 md:h-56 lg:h-72 border-b border-[var(--border-raw)] overflow-hidden">
        {user.bannerUrl ? (
          <Image src={user.bannerUrl} alt="Banner" fill className="object-cover opacity-60" />
        ) : (
          <div className="w-full h-full radar-grid" style={{ background: bannerGradient }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-void)] to-transparent" />

        {/* Avatar overlapping banner bottom */}
        <div className="absolute -bottom-8 left-6 flex items-end gap-4">
          <div className="border-2 border-[var(--accent-acid)]">
            <Avatar src={user.avatar} name={user.displayName || user.name || user.username || "?"} size="xl" online={isOnline} />
          </div>
        </div>
      </div>

      {/* ── IDENTITY ── */}
      <div className="pt-12 pb-6 px-6 border-b border-[var(--border-raw)] flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-display tracking-widest text-[var(--text-primary)] glitch" data-text={user.displayName || user.name || user.username}>
              {user.displayName || user.name || user.username}
            </h1>
            {user.isVerified && <span className="text-[10px] font-mono text-[var(--accent-acid)] border border-[var(--accent-acid)] px-2 py-0.5">VERIFIED</span>}
            {isOnline && <span className="text-[10px] font-mono text-[var(--accent-acid)] flex items-center gap-1"><span className="online-dot">◉</span> ONLINE</span>}
            {user.badges?.map((badge: { id: string; type: string }) => {
              const meta = getBadgeMeta(badge.type as Parameters<typeof getBadgeMeta>[0]);
              return meta ? (
                <span key={badge.id} className="text-[10px] font-mono border px-2 py-0.5" style={{ color: meta.color, borderColor: meta.color }} title={meta.description}>
                  [{meta.icon} {meta.label}]
                </span>
              ) : null;
            })}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-sm font-mono text-[var(--accent-static)]">@{user.username}</span>
            {user.location && <span className="text-xs font-mono text-[var(--text-ghost)]">// {user.location}</span>}
            {user.website && <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[var(--text-dim)] hover:text-[var(--accent-acid)] transition-colors">{user.website.replace(/^https?:\/\//, "")}</a>}
          </div>
          {user.tagline && <p className="mt-2 text-sm font-mono text-[var(--text-dim)] italic">&quot;{user.tagline}&quot;</p>}

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4 text-[10px] font-mono text-[var(--text-ghost)]">
            <span><span className="text-[var(--text-primary)] font-bold">{user._count.posts}</span> POSTS</span>
            <span className="text-[var(--border-raw)]">//</span>
            <span><span className="text-[var(--text-primary)] font-bold">{user.tradeCount}</span> TRADES</span>
            <span className="text-[var(--border-raw)]">//</span>
            <span><span className="text-[var(--text-primary)] font-bold">{user._count.followers}</span> FOLLOWERS</span>
            <span className="text-[var(--border-raw)]">//</span>
            <span><span className="text-[var(--text-primary)] font-bold">{user._count.following}</span> FOLLOWING</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isOwn ? (
            <Link href="/settings" className="px-4 py-2 text-xs font-mono tracking-widest border border-[var(--border-raw)] text-[var(--text-dim)] hover:border-[var(--accent-acid)] hover:text-[var(--accent-acid)] transition-all duration-[80ms]">
              // EDIT PROFILE
            </Link>
          ) : session ? (
            <>
              <FollowButton userId={user.id} initialFollowing={isFollowing} />
              <MessageButton userId={user.id} username={user.username || user.name || "?"} />
            </>
          ) : (
            <Link href="/login" className="px-4 py-2 text-xs font-mono tracking-widest border border-[var(--accent-acid)] text-[var(--accent-acid)] hover:bg-[var(--accent-acid)] hover:text-[var(--bg-void)] transition-all duration-[80ms]">
              LOGIN TO INTERACT
            </Link>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-0 lg:gap-px bg-transparent lg:bg-[var(--border-raw)]">
        {/* ── LEFT SIDEBAR ── */}
        <div className="lg:bg-[var(--bg-void)] flex flex-col divide-y divide-[var(--border-raw)]">
          {/* Bio */}
          {user.bio && (
            <div className="p-6">
              <div className="text-[10px] font-mono tracking-widest text-[var(--accent-static)] mb-2">// ABOUT</div>
              <p className="text-xs font-mono text-[var(--text-dim)] leading-loose">{user.bio}</p>
            </div>
          )}

          {/* Skills */}
          {user.skills?.length > 0 && (
            <div className="p-6">
              <div className="text-[10px] font-mono tracking-widest text-[var(--accent-static)] mb-3">// SKILLS</div>
              <div className="flex flex-wrap gap-1.5">
                {user.skills.map((s: string) => <Badge key={s} variant="offer">{s}</Badge>)}
              </div>
            </div>
          )}

          {/* Interests */}
          {user.interests?.length > 0 && (
            <div className="p-6">
              <div className="text-[10px] font-mono tracking-widest text-[var(--accent-static)] mb-3">// INTERESTS</div>
              <div className="flex flex-wrap gap-1.5">
                {user.interests.map((s: string) => <Badge key={s} variant="seek">{s}</Badge>)}
              </div>
            </div>
          )}

          {/* Trade style */}
          {user.tradeStyle && (
            <div className="p-6">
              <div className="text-[10px] font-mono tracking-widest text-[var(--accent-static)] mb-2">// TRADE STYLE</div>
              <p className="text-xs font-mono text-[var(--text-dim)]">{user.tradeStyle}</p>
            </div>
          )}

          {/* Badges */}
          {user.badges?.length > 0 && (
            <div className="p-6">
              <div className="text-[10px] font-mono tracking-widest text-[var(--accent-static)] mb-3">// BADGES</div>
              <div className="flex flex-col gap-2">
                {user.badges.map((badge: { id: string; type: string; earnedAt: string }) => {
                  const meta = getBadgeMeta(badge.type as Parameters<typeof getBadgeMeta>[0]);
                  return meta ? (
                    <div key={badge.id} className="flex items-center gap-2">
                      <span className="text-xs font-mono border px-2 py-0.5" style={{ color: meta.color, borderColor: meta.color }}>
                        {meta.icon} {meta.label}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-ghost)]">{meta.description}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Rating */}
          <div className="p-6">
            <div className="text-[10px] font-mono tracking-widest text-[var(--accent-static)] mb-3">// REPUTATION</div>
            <StarRating value={user.rating} size="sm" />
            <p className="text-xs font-mono text-[var(--text-dim)] mt-1">
              {user.rating > 0 ? `${user.rating.toFixed(1)} / 5.0` : "NO RATINGS YET"}
              {" "} · {user.receivedReviews?.length ?? 0} reviews
            </p>
          </div>

          <div className="p-6">
            <p className="text-[10px] font-mono text-[var(--text-ghost)]">MEMBER SINCE {formatDate(user.createdAt)}</p>
          </div>
        </div>

        {/* ── RIGHT CONTENT ── */}
        <div className="lg:col-span-2 lg:bg-[var(--bg-void)] flex flex-col divide-y divide-[var(--border-raw)]">
          {/* Posts */}
          <div className="p-6">
            <div className="text-[10px] font-mono tracking-widest text-[var(--accent-static)] mb-4">
              // ACTIVE TRADES [{user.posts.length}]
            </div>
            {user.posts.length === 0 ? (
              <p className="text-xs font-mono text-[var(--text-ghost)]">// NO ACTIVE POSTS</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-px bg-[var(--border-raw)]">
                {user.posts.map((post: Parameters<typeof PostCard>[0]["post"]) => (
                  <div key={post.id} className="bg-[var(--bg-void)]">
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="p-6">
            <div className="text-[10px] font-mono tracking-widest text-[var(--accent-static)] mb-4">
              // REVIEWS [{user.receivedReviews.length}]
            </div>
            {user.receivedReviews.length === 0 ? (
              <p className="text-xs font-mono text-[var(--text-ghost)]">// NO REVIEWS YET</p>
            ) : (
              <div className="flex flex-col divide-y divide-[var(--border-raw)]">
                {user.receivedReviews.map((review: {
                  id: string;
                  rating: number;
                  comment?: string | null;
                  createdAt: string;
                  reviewer: { id: string; name?: string | null; avatar?: string | null; username?: string | null };
                }) => (
                  <div key={review.id} className="py-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar src={review.reviewer.avatar} name={review.reviewer.name || "?"} size="xs" />
                        <span className="text-xs font-mono text-[var(--accent-static)]">
                          @{review.reviewer.username || review.reviewer.name}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-ghost)]">{timeAgo(review.createdAt)}</span>
                      </div>
                      <div className="font-mono text-xs text-[var(--accent-acid)]">
                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-xs font-mono text-[var(--text-dim)] leading-loose pl-8">&ldquo;{review.comment}&rdquo;</p>
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
