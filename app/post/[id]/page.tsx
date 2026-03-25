export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CATEGORIES, POST_STATUSES } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import StarRating from "@/components/ui/StarRating";
import PostCard from "@/components/PostCard";
import ProposeTradeButton from "./ProposeTradeButton";
import { rankMatches } from "@/lib/matching";

async function getPost(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          bio: true,
          location: true,
          rating: true,
          tradeCount: true,
        },
      },
    },
  });
}

async function getMatches(post: { id: string; offerKeywords: string[]; seekKeywords: string[] }) {
  const candidates = await prisma.post.findMany({
    where: { status: "ACTIVE", id: { not: post.id } },
    select: { id: true, offerKeywords: true, seekKeywords: true },
  });
  const ranked = rankMatches(post, candidates).slice(0, 6);
  if (ranked.length === 0) return [];
  const matchedPosts = await prisma.post.findMany({
    where: { id: { in: ranked.map((r) => r.postId) } },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });
  return ranked.map((r) => ({
    ...matchedPosts.find((p) => p.id === r.postId)!,
    matchScore: r.score,
    mutual: r.mutual,
  }));
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, session] = await Promise.all([getPost(id), auth()]);

  if (!post || post.status === "REMOVED") notFound();

  const matches = post.status === "ACTIVE" ? await getMatches(post) : [];
  const category = CATEGORIES.find((c) => c.value === post.category);
  const statusInfo = POST_STATUSES[post.status as keyof typeof POST_STATUSES];
  const isOwner = session?.user?.id === post.userId;
  const isActive = post.status === "ACTIVE";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Images */}
          {post.images.length > 0 ? (
            <div className="card overflow-hidden">
              <div className="relative h-80">
                <Image
                  src={post.images[0]}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              {post.images.length > 1 && (
                <div className="flex gap-2 p-3">
                  {post.images.slice(1).map((img, i) => (
                    <div key={i} className="relative w-16 h-16 overflow-hidden">
                      <Image src={img} alt="" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="card h-64 flex items-center justify-center text-7xl">
              {category?.icon ?? "📦"}
            </div>
          )}

          {/* Title & meta */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] text-[var(--text-dim)] font-medium">
                    {category?.icon} {category?.label}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">{post.title}</h1>
                <p className="text-sm text-[var(--text-dim)] mt-1">
                  Posted {timeAgo(post.createdAt)}
                  {post.estimatedValue && ` · ~$${post.estimatedValue} estimated value`}
                </p>
              </div>
              {isOwner && (
                <Link href={`/post/${post.id}/edit`}>
                  <button className="text-sm px-3 py-1.5 border border-[var(--border-raw)] text-[var(--text-dim)] hover:bg-[var(--bg-elevated)] transition-colors">
                    Edit
                  </button>
                </Link>
              )}
            </div>
            <p className="text-[var(--text-primary)] leading-relaxed">{post.description}</p>
          </div>

          {/* Keywords */}
          <div className="card p-6 flex flex-col gap-4">
            <h2 className="font-semibold font-display tracking-widest uppercase text-[var(--text-primary)]">Trade Keywords</h2>
            {post.offerKeywords.length > 0 && (
              <div>
                <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-2">
                  🟢 Offering
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.offerKeywords.map((k) => (
                    <Badge key={k} variant="offer">{k}</Badge>
                  ))}
                </div>
              </div>
            )}
            {post.seekKeywords.length > 0 && (
              <div>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-2">
                  🟡 Seeking
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.seekKeywords.map((k) => (
                    <Badge key={k} variant="seek">{k}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Potential Matches */}
          {matches.length > 0 && (
            <div>
              <h2 className="font-semibold font-display tracking-widest uppercase text-[var(--text-primary)] mb-3">
                Potential Matches
                <span className="ml-2 text-xs font-normal text-[var(--text-dim)]">
                  Posts with overlapping keywords
                </span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {matches.map((match) => (
                  <PostCard
                    key={match.id}
                    post={match}
                    matchScore={match.matchScore}
                    mutual={match.mutual}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          {/* CTA */}
          {!isOwner && isActive && session && (
            <div className="card p-5">
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">Interested?</h3>
              <p className="text-sm text-[var(--text-dim)] mb-4">
                Propose a trade by offering one of your own posts in exchange.
              </p>
              <ProposeTradeButton
                requestedPostId={post.id}
                requestedPostTitle={post.title}
              />
            </div>
          )}
          {!session && isActive && (
            <div className="card p-5 text-center">
              <p className="text-sm text-[var(--text-dim)] mb-4">
                Sign in to propose a trade
              </p>
              <Link href="/login">
                <button className="w-full py-2 px-4 bg-[var(--accent-acid)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
                  Sign In to Trade
                </button>
              </Link>
            </div>
          )}
          {!isActive && (
            <div className="card p-5 text-center">
              <span className={`inline-block text-sm px-3 py-1.5 rounded-full font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              <p className="text-xs text-[var(--text-dim)] mt-2">
                This trade is no longer available.
              </p>
            </div>
          )}

          {/* Owner info */}
          <div className="card p-5">
            <h3 className="font-semibold font-display tracking-widest uppercase text-[var(--text-primary)] mb-4">About the Trader</h3>
            <Link href={`/profile/${post.user.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Avatar src={post.user.avatar} name={post.user.name || "User"} size="lg" />
              <div>
                <p className="font-medium text-[var(--text-primary)]">{post.user.name}</p>
                {post.user.location && (
                  <p className="text-xs text-[var(--text-dim)]">📍 {post.user.location}</p>
                )}
              </div>
            </Link>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[var(--border-raw)]">
              <div className="text-center">
                <div className="text-lg font-bold text-[var(--text-primary)]">{post.user.tradeCount}</div>
                <div className="text-xs text-[var(--text-dim)]">Trades</div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <StarRating value={post.user.rating} size="sm" />
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    {post.user.rating > 0 ? post.user.rating.toFixed(1) : "—"}
                  </span>
                </div>
                <div className="text-xs text-[var(--text-dim)]">Rating</div>
              </div>
            </div>
            {post.user.bio && (
              <p className="text-sm text-[var(--text-dim)] mt-3 leading-relaxed line-clamp-3">
                {post.user.bio}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
