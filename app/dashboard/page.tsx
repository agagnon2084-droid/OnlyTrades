"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { PostCardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/EmptyState";
import { CATEGORIES, TRADE_REQUEST_STATUSES } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import toast from "react-hot-toast";

type Tab = "posts" | "incoming" | "outgoing" | "notifications" | "matches";

interface TradeRequest {
  id: string;
  status: string;
  message?: string;
  createdAt: string;
  fromUser: { id: string; name: string | null; avatar: string | null };
  toUser: { id: string; name: string | null; avatar: string | null };
  offeredPost: { id: string; title: string; images: string[]; category: string };
  requestedPost: { id: string; title: string; images: string[]; category: string };
}

interface Post {
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
  createdAt: string;
  matchScore?: number;
  mutual?: boolean;
  user: { id: string; name: string | null; avatar: string | null };
}

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  linkTo?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [incoming, setIncoming] = useState<TradeRequest[]>([]);
  const [outgoing, setOutgoing] = useState<TradeRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [matches, setMatches] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!session?.user?.id) return;
    setLoading(true);
    const fetches: Promise<void>[] = [
      fetch(`/api/posts?userId=${session.user.id}&status=ACTIVE&limit=50`).then(r => r.json()).then(d => setPosts(d.posts || [])),
      fetch("/api/trades?direction=received").then(r => r.json()).then(d => setIncoming(d.trades || [])),
      fetch("/api/trades?direction=sent").then(r => r.json()).then(d => setOutgoing(d.trades || [])),
      fetch("/api/notifications").then(r => r.json()).then(d => { setNotifications(d.notifications || []); setUnreadCount(d.unreadCount || 0); }),
      fetch("/api/discover?limit=6").then(r => r.json()).then(d => setMatches((d.posts || []).filter((p: Post) => (p.matchScore ?? 0) > 0).slice(0, 6))),
    ];
    Promise.all(fetches).finally(() => setLoading(false));
  }, [session?.user?.id]);

  const handleTradeAction = async (id: string, action: string) => {
    try {
      const res = await fetch(`/api/trades/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Action failed");
      toast.success(`Trade ${action}ed!`);
      const [inc, out] = await Promise.all([
        fetch("/api/trades?direction=received").then(r => r.json()),
        fetch("/api/trades?direction=sent").then(r => r.json()),
      ]);
      setIncoming(inc.trades || []);
      setOutgoing(out.trades || []);
    } catch {
      toast.error("Action failed");
    }
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: "all" }),
    });
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
    setUnreadCount(0);
  };

  if (status === "loading") return null;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "posts", label: "MY POSTS", count: posts.length },
    { id: "incoming", label: "INCOMING", count: incoming.filter(t => t.status === "PENDING").length },
    { id: "outgoing", label: "OUTGOING", count: outgoing.length },
    { id: "matches", label: "MATCHES", count: matches.length },
    { id: "notifications", label: "ALERTS", count: unreadCount || undefined },
  ];

  const TradeCard = ({ trade, dir }: { trade: TradeRequest; dir: "incoming" | "outgoing" }) => {
    const statusInfo = TRADE_REQUEST_STATUSES[trade.status as keyof typeof TRADE_REQUEST_STATUSES];
    const cat = CATEGORIES.find(c => c.value === trade.offeredPost.category);
    const reqCat = CATEGORIES.find(c => c.value === trade.requestedPost.category);
    const other = dir === "incoming" ? trade.fromUser : trade.toUser;

    return (
      <div className="card p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Avatar src={other.avatar} name={other.name || "User"} size="sm" />
            <div>
              <p className="text-sm font-mono font-medium text-[var(--text-primary)]">{other.name}</p>
              <p className="text-[10px] font-mono text-[var(--text-dim)]">{timeAgo(trade.createdAt)}</p>
            </div>
          </div>
          <span className={`text-[10px] font-mono tracking-widest px-2.5 py-1 border font-medium ${statusInfo?.color ?? "border-[var(--border-raw)] text-[var(--text-dim)]"}`}>
            {statusInfo?.label?.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="flex-1 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-raw)] text-center">
            <div className="text-lg">{cat?.icon}</div>
            <p className="text-xs font-mono font-medium text-[var(--text-primary)] line-clamp-1">{trade.offeredPost.title}</p>
            <p className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest">offered</p>
          </div>
          <span className="text-[var(--text-ghost)] font-mono">⇄</span>
          <div className="flex-1 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-raw)] text-center">
            <div className="text-lg">{reqCat?.icon}</div>
            <p className="text-xs font-mono font-medium text-[var(--text-primary)] line-clamp-1">{trade.requestedPost.title}</p>
            <p className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest">requested</p>
          </div>
        </div>

        {trade.message && (
          <p className="text-xs font-mono text-[var(--text-dim)] italic border-l-2 border-[var(--accent-acid)] pl-3 line-clamp-2">
            &ldquo;{trade.message}&rdquo;
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {dir === "incoming" && trade.status === "PENDING" && (
            <>
              <Button size="sm" onClick={() => handleTradeAction(trade.id, "accept")}>ACCEPT</Button>
              <Button size="sm" variant="outline" onClick={() => handleTradeAction(trade.id, "decline")}>DECLINE</Button>
            </>
          )}
          {trade.status === "ACCEPTED" && (
            <Button size="sm" variant="secondary" onClick={() => handleTradeAction(trade.id, "complete")}>
              MARK COMPLETE
            </Button>
          )}
          {dir === "outgoing" && ["PENDING", "ACCEPTED"].includes(trade.status) && (
            <Button size="sm" variant="ghost" onClick={() => handleTradeAction(trade.id, "cancel")}>
              CANCEL
            </Button>
          )}
          {trade.status === "COMPLETED" && (
            <Link href={`/profile/${other.id}?review=${trade.id}`}>
              <Button size="sm" variant="outline">LEAVE REVIEW</Button>
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-[10px] font-mono tracking-widest text-[var(--accent-static)] mb-2">// CONTROL CENTER</div>
          <h1 className="text-3xl font-display tracking-widest text-[var(--text-primary)]">DASHBOARD</h1>
          <p className="text-xs font-mono text-[var(--text-dim)] mt-1">
            Welcome back, {session?.user?.name?.split(" ")[0]?.toUpperCase()}
          </p>
        </div>
        <Link href="/post/new">
          <Button>+ NEW TRADE</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-6 overflow-x-auto pb-0 border-b border-[var(--border-raw)]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-mono tracking-widest whitespace-nowrap transition-all duration-[80ms] border-b-2 ${
              tab === t.id
                ? "text-[var(--accent-acid)] border-b-[var(--accent-acid)]"
                : "text-[var(--text-dim)] border-b-transparent hover:text-[var(--text-primary)]"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 font-mono ${t.id === "notifications" ? "bg-[var(--accent-burn)] text-[var(--bg-void)]" : "text-[var(--text-ghost)]"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border-raw)]">
          {[1,2,3].map(i => (
            <div key={i} className="bg-[var(--bg-void)]">
              <PostCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* My Posts */}
          {tab === "posts" && (
            posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="text-sm font-mono tracking-widest text-[var(--text-dim)] mb-2">[ NO ACTIVE TRADES ]</div>
                <p className="text-xs font-mono text-[var(--text-ghost)] max-w-sm mb-6 leading-relaxed">
                  You haven&apos;t posted anything yet. The collective is waiting.
                </p>
                <div className="flex gap-3">
                  <Link href="/post/new"><Button>+ POST YOUR FIRST TRADE</Button></Link>
                  <Link href="/discover"><Button variant="outline">BROWSE WHAT&apos;S AVAILABLE →</Button></Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border-raw)]">
                {posts.map(p => (
                  <div key={p.id} className="bg-[var(--bg-void)]">
                    <PostCard post={p} />
                  </div>
                ))}
              </div>
            )
          )}

          {/* Incoming */}
          {tab === "incoming" && (
            incoming.length === 0 ? (
              <EmptyState icon="[ ]" title="No incoming requests" description="When others propose a trade for your posts, they'll appear here." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {incoming.map(t => <TradeCard key={t.id} trade={t} dir="incoming" />)}
              </div>
            )
          )}

          {/* Outgoing */}
          {tab === "outgoing" && (
            outgoing.length === 0 ? (
              <EmptyState icon="[ ]" title="No outgoing requests" description="Browse trades and propose a swap!" action={<Link href="/discover"><Button variant="outline">BROWSE TRADES</Button></Link>} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {outgoing.map(t => <TradeCard key={t.id} trade={t} dir="outgoing" />)}
              </div>
            )
          )}

          {/* Matches */}
          {tab === "matches" && (
            matches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="text-sm font-mono tracking-widest text-[var(--text-dim)] mb-2">[ NO MATCHES YET ]</div>
                <p className="text-xs font-mono text-[var(--text-ghost)] max-w-sm mb-6 leading-relaxed">
                  Add seek keywords to your posts to find traders who have what you want.
                </p>
                <Link href="/post/new"><Button variant="outline">UPDATE YOUR POSTS →</Button></Link>
              </div>
            ) : (
              <div>
                <p className="text-xs font-mono text-[var(--text-dim)] mb-4 tracking-widest">
                  // POSTS MATCHING YOUR ACTIVE SEEK KEYWORDS
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border-raw)]">
                  {matches.map(p => (
                    <div key={p.id} className="bg-[var(--bg-void)]">
                      <PostCard post={p} matchScore={p.matchScore} mutual={p.mutual} />
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Notifications */}
          {tab === "notifications" && (
            <div>
              {notifications.length > 0 && unreadCount > 0 && (
                <div className="flex justify-end mb-4">
                  <Button variant="ghost" size="sm" onClick={markAllRead}>MARK ALL READ</Button>
                </div>
              )}
              {notifications.length === 0 ? (
                <EmptyState icon="[ ]" title="No notifications" description="You're all caught up." />
              ) : (
                <div className="flex flex-col gap-2">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`card p-4 flex items-start gap-3 ${!n.read ? "bg-[var(--bg-elevated)]" : ""}`}
                    >
                      <div className="w-2 h-2 mt-1.5 flex-shrink-0" style={{ background: n.read ? "transparent" : "var(--accent-acid)" }} />
                      <div className="flex-1">
                        <p className="text-sm font-mono text-[var(--text-primary)]">{n.message}</p>
                        <p className="text-[10px] font-mono text-[var(--text-dim)] mt-0.5">{timeAgo(n.createdAt)}</p>
                      </div>
                      {n.linkTo && (
                        <Link href={n.linkTo} className="text-xs font-mono text-[var(--accent-acid)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0">
                          VIEW →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
