import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { timeAgo } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    description: string;
    category: string;
    type: string;
    status: string;
    offerKeywords: string[];
    seekKeywords: string[];
    images: string[];
    estimatedValue?: number | null;
    createdAt: Date | string;
    user: { id: string; name?: string | null; avatar?: string | null; username?: string | null };
  };
  matchScore?: number;
  mutual?: boolean;
}

const STATUS_SYMBOLS: Record<string, string> = {
  ACTIVE: "◉",
  PENDING: "⌛",
  TRADED: "✓",
  REMOVED: "✗",
};
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "text-[var(--accent-acid)]",
  PENDING: "text-amber-500",
  TRADED: "text-[var(--text-ghost)]",
  REMOVED: "text-[var(--accent-burn)]",
};

export default function PostCard({ post, matchScore, mutual }: PostCardProps) {
  const category = CATEGORIES.find((c) => c.value === post.category);
  const thumbnail = post.images[0];

  return (
    <Link href={`/post/${post.id}`} className="card block overflow-hidden group transition-all duration-[80ms]">
      {/* Thumbnail */}
      <div className="relative h-40 bg-[var(--bg-elevated)] overflow-hidden">
        {thumbnail ? (
          <Image src={thumbnail} alt={post.title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-[80ms]" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-30 font-mono">
            {category?.icon ?? "[?]"}
          </div>
        )}
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-void)]/60 to-transparent" />
        <div className="absolute top-2 left-2 flex items-center gap-2">
          <span className="text-[10px] font-[\'Bebas_Neue\'] tracking-widest px-2 py-0.5 bg-[var(--bg-void)]/80 text-[var(--text-dim)] border border-[var(--border-raw)]">
            {category?.label}
          </span>
          {mutual && (
            <span className="text-[10px] font-mono px-2 py-0.5 bg-[var(--accent-acid)] text-[var(--bg-void)]">
              ✦ MUTUAL
            </span>
          )}
          {!mutual && matchScore !== undefined && matchScore > 0 && (
            <span className="text-[10px] font-mono px-2 py-0.5 border border-amber-500 text-amber-500">
              {matchScore} MATCH{matchScore !== 1 ? "ES" : ""}
            </span>
          )}
        </div>
        <div className={`absolute top-2 right-2 text-[10px] font-mono ${STATUS_COLORS[post.status] ?? "text-[var(--text-dim)]"}`}>
          {STATUS_SYMBOLS[post.status]} {post.status}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2.5">
        <h3 className="font-mono font-medium text-[var(--text-primary)] line-clamp-2 leading-snug text-sm">
          {post.title}
        </h3>
        <p className="text-xs font-mono text-[var(--text-dim)] line-clamp-2 leading-relaxed">
          {post.description}
        </p>

        {/* Tags */}
        <div className="flex flex-col gap-1.5">
          {post.offerKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[10px] font-mono text-[var(--text-ghost)] mr-1">OFFER:</span>
              {post.offerKeywords.slice(0, 3).map((k) => (
                <Badge key={k} variant="offer">{k}</Badge>
              ))}
              {post.offerKeywords.length > 3 && <Badge variant="offer">+{post.offerKeywords.length - 3}</Badge>}
            </div>
          )}
          {post.seekKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[10px] font-mono text-[var(--text-ghost)] mr-1">SEEK:</span>
              {post.seekKeywords.slice(0, 3).map((k) => (
                <Badge key={k} variant="seek">{k}</Badge>
              ))}
              {post.seekKeywords.length > 3 && <Badge variant="seek">+{post.seekKeywords.length - 3}</Badge>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-raw)]">
          <div className="flex items-center gap-2">
            <Avatar src={post.user.avatar} name={post.user.name || "?"} size="xs" />
            <span className="text-[10px] font-mono text-[var(--text-dim)]">
              {post.user.username ? `@${post.user.username}` : (post.user.name || "anon")}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-ghost)]">{timeAgo(post.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
