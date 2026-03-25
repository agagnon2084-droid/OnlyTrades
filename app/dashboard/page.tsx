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
      // Refresh
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
    { id: "posts", label: "My Posts", count: posts.length },
    { id: "incoming", label: "Incoming", count: incoming.filter(t => t.status === "PENDING").length },
    { id: "outgoing", label: "Outgoing", count: outgoing.length },
    { id: "matches", label: "My Matches", count: matches.length },
    { id: "notifications", label: "Notifications", count: unreadCount || undefined },
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
              <p className="text-sm font-medium text-[var(--foreground)]">{other.name}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{timeAgo(trade.createdAt)}</p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo?.color ?? ""}`}>
            {statusInfo?.label}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="flex-1 px-3 py-2 rounded-lg bg-[var(--muted)] text-center">
            <div className="text-lg">{cat?.icon}</div>
            <p className="text-xs font-medium text-[var(--foreground)] line-clamp-1">{trade.offeredPost.title}</p>
            <p className="text-xs text-[var(--muted-foreground)]">offered</p>
          </div>
          <span className="text-[var(--muted-foreground)]">⇄</span>
          <div className="flex-1 px-3 py-2 rounded-lg bg-[var(--muted)] text-center">
            <div className="text-lg">{reqCat?.icon}</div>
            <p className="text-xs font-medium text-[var(--foreground)] line-clamp-1">{trade.requestedPost.title}</p>
            <p className="text-xs text-[var(--muted-foreground)]">requested</p>
          </div>
        </div>

        {trade.message && (
          <p className="text-xs text-[var(--muted-foreground)] italic border-l-2 border-[var(--border)] pl-3 line-clamp-2">
            &ldquo;{trade.message}&rdquo;
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {dir === "incoming" && trade.status === "PENDING" && (
            <>
              <Button size="sm" onClick={() => handleTradeAction(trade.id, "accept")}>Accept</Button>
              <Button size="sm" variant="outline" onClick={() => handleTradeAction(trade.id, "decline")}>Decline</Button>
            </>
          )}
          {trade.status === "ACCEPTED" && (
            <Button size="sm" variant="secondary" onClick={() => handleTradeAction(trade.id, "complete")}>
              Mark Complete
            </Button>
          )}
          {dir === "outgoing" && ["PENDING", "ACCEPTED"].includes(trade.status) && (
            <Button size="sm" variant="ghost" onClick={() => handleTradeAction(trade.id, "cancel")}>
              Cancel
            </Button>
          )}
          {trade.status === "COMPLETED" && (
            <Link href={`/profile/${other.id}?review=${trade.id}`}>
              <Button size="sm" variant="outline">Leave Review</Button>
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
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Dashboard</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-0.5">
            Welcome back, {session?.user?.name?.split(" ")[0]}
          </p>
        </div>
        <Link href="/post/new">
          <Button>+ New Trade Post</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 border-b border-[var(--border)]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-all ${
              tab === t.id
                ? "bg-[var(--card)] text-[var(--foreground)] border border-b-0 border-[var(--border)] -mb-px"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${t.id === "notifications" ? "bg-red-500 text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => <PostCardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          {/* My Posts */}
          {tab === "posts" && (
            posts.length === 0 ? (
              <EmptyState
                icon="📝"
                title="No active posts yet"
                description="Create your first trade post and start connecting with the community."
                action={<Link href="/post/new"><Button>Post Your First Trade</Button></Link>}
              />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.map(p => <PostCard key={p.id} post={p} />)}
              </div>
            )
          )}

          {/* Incoming */}
          {tab === "incoming" && (
            incoming.length === 0 ? (
              <EmptyState icon="📬" title="No incoming requests" description="When others propose a trade for your posts, they'll appear here." />
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {incoming.map(t => <TradeCard key={t.id} trade={t} dir="incoming" />)}
              </div>
            )
          )}

          {/* Outgoing */}
          {tab === "outgoing" && (
            outgoing.length === 0 ? (
              <EmptyState icon="📤" title="No outgoing requests" description="Browse trades and propose a swap!" action={<Link href="/discover"><Button variant="outline">Browse Trades</Button></Link>} />
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {outgoing.map(t => <TradeCard key={t.id} trade={t} dir="outgoing" />)}
              </div>
            )
          )}

          {/* Matches */}
          {tab === "matches" && (
            matches.length === 0 ? (
              <EmptyState icon="🔍" title="No matches yet" description="Add seek keywords to your posts and we'll surface relevant trades here." action={<Link href="/post/new"><Button variant="outline">Create a Post with Keywords</Button></Link>} />
            ) : (
              <div>
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  Posts that match your active posts&apos; seek keywords:
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {matches.map(p => <PostCard key={p.id} post={p} matchScore={p.matchScore} mutual={p.mutual} />)}
                </div>
              </div>
            )
          )}

          {/* Notifications */}
          {tab === "notifications" && (
            <div>
              {notifications.length > 0 && unreadCount > 0 && (
                <div className="flex justify-end mb-4">
                  <Button variant="ghost" size="sm" onClick={markAllRead}>Mark all read</Button>
                </div>
              )}
              {notifications.length === 0 ? (
                <EmptyState icon="🔔" title="No notifications" description="You're all caught up!" />
              ) : (
                <div className="flex flex-col gap-2">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`card p-4 flex items-start gap-3 ${!n.read ? "border-[var(--primary)]/30 bg-[var(--earth-50,#faf7f2)]" : ""}`}
                    >
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.read ? "transparent" : "var(--primary)" }} />
                      <div className="flex-1">
                        <p className="text-sm text-[var(--foreground)]">{n.message}</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{timeAgo(n.createdAt)}</p>
                      </div>
                      {n.linkTo && (
                        <Link href={n.linkTo} className="text-xs text-[var(--primary)] hover:underline flex-shrink-0">
                          View →
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
