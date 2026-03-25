"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { PostCardSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

interface Member {
  id: string;
  name: string | null;
  username: string | null;
  displayName: string | null;
  avatar: string | null;
  tagline: string | null;
  skills: string[];
  tradeCount: number;
  rating: number;
  lastActiveAt: string | null;
  isVerified: boolean;
  _count: { followers: number };
}

function MembersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [total, setTotal] = useState(0);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    try {
      const res = await fetch(`/api/members?${params}`);
      const data = await res.json();
      setMembers(data.users || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const isOnline = (lastActiveAt: string | null) =>
    lastActiveAt && (Date.now() - new Date(lastActiveAt).getTime()) < 10 * 60 * 1000;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="text-[10px] font-mono tracking-widest text-[var(--accent-static)] mb-2">// DIRECTORY</div>
        <h1 className="text-4xl font-display tracking-widest text-[var(--text-primary)]">MEMBERS</h1>
        <p className="text-xs font-mono text-[var(--text-ghost)] mt-1">{total} REGISTERED TRADERS</p>
      </div>

      {/* Search */}
      <div className="mb-8 flex gap-3 border-b border-[var(--border-raw)] pb-6">
        <input
          type="text"
          placeholder="SEARCH BY NAME, USERNAME, OR SKILL..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && fetchMembers()}
          className="flex-1 bg-transparent border-b border-[var(--border-raw)] focus:border-[var(--accent-acid)] px-0 py-2 text-xs font-mono text-[var(--text-primary)] placeholder:text-[var(--text-ghost)] outline-none transition-colors"
        />
        <button
          onClick={fetchMembers}
          className="px-4 py-2 text-xs font-mono tracking-widest border border-[var(--accent-acid)] text-[var(--accent-acid)] hover:bg-[var(--accent-acid)] hover:text-[var(--bg-void)] transition-all duration-[80ms]"
        >
          SEARCH
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-[var(--border-raw)]">
          {Array.from({ length: 6 }).map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
      ) : members.length === 0 ? (
        <div className="py-20 text-center text-xs font-mono text-[var(--text-ghost)]">// NO MEMBERS FOUND</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-[var(--border-raw)]">
          {members.map(member => (
            <Link
              key={member.id}
              href={member.username ? `/u/${member.username}` : `/profile/${member.id}`}
              className="card bg-[var(--bg-void)] p-5 flex flex-col gap-3 group transition-all duration-[80ms]"
            >
              <div className="flex items-start gap-3">
                <Avatar src={member.avatar} name={member.displayName || member.name || member.username || "?"} size="md" online={isOnline(member.lastActiveAt) || false} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-acid)] transition-colors truncate">
                      {member.displayName || member.name || member.username}
                    </span>
                    {member.isVerified && <span className="text-[9px] font-mono text-[var(--accent-acid)] border border-[var(--accent-acid)] px-1 flex-shrink-0">VFD</span>}
                  </div>
                  {member.username && <div className="text-[10px] font-mono text-[var(--accent-static)]">@{member.username}</div>}
                  {member.tagline && <div className="text-[10px] font-mono text-[var(--text-ghost)] truncate mt-0.5">&ldquo;{member.tagline}&rdquo;</div>}
                </div>
              </div>
              {member.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {member.skills.slice(0, 4).map(s => <Badge key={s} variant="offer">{s}</Badge>)}
                  {member.skills.length > 4 && <Badge variant="default">+{member.skills.length - 4}</Badge>}
                </div>
              )}
              <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--text-ghost)] pt-2 border-t border-[var(--border-raw)]">
                <span>{member.tradeCount} TRADES</span>
                <span>//</span>
                <span>{member._count.followers} FOLLOWERS</span>
                {member.rating > 0 && <><span>//</span><span className="text-[var(--accent-acid)]">★ {member.rating.toFixed(1)}</span></>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MembersPage() {
  return <Suspense fallback={<div className="p-8 text-xs font-mono text-[var(--text-ghost)]">// LOADING...</div>}><MembersContent /></Suspense>;
}
