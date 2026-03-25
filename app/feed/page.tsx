"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PostCard from "@/components/PostCard";
import { PostCardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";

interface Post {
  id: string; title: string; description: string; category: string; type: string;
  status: string; offerKeywords: string[]; seekKeywords: string[]; images: string[];
  estimatedValue?: number | null; createdAt: string;
  user: { id: string; name: string | null; avatar: string | null; username: string | null };
}

export default function FeedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFollows, setHasFollows] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/feed").then(r => r.json()).then(d => {
      setPosts(d.posts || []);
      setHasFollows(d.hasFollows ?? true);
    }).finally(() => setLoading(false));
  }, [session]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="text-[10px] font-mono tracking-widest text-[var(--accent-static)] mb-2">// COLLECTIVE FEED</div>
        <h1 className="text-4xl font-display tracking-widest text-[var(--text-primary)]">YOUR FEED</h1>
      </div>
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border-raw)]">
          {Array.from({ length: 6 }).map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
      ) : !hasFollows ? (
        <EmptyState icon="[ ]" title="NO CONNECTIONS YET"
          description="// Follow traders to see their posts here."
          action={<Link href="/members" className="px-4 py-2 text-xs font-mono border border-[var(--accent-acid)] text-[var(--accent-acid)] hover:bg-[var(--accent-acid)] hover:text-[var(--bg-void)] transition-all duration-[80ms]">FIND TRADERS</Link>} />
      ) : posts.length === 0 ? (
        <EmptyState icon="[ ]" title="FEED IS EMPTY" description="// Traders you follow haven't posted yet." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border-raw)]">
          {posts.map(post => <div key={post.id} className="bg-[var(--bg-void)]"><PostCard post={post} /></div>)}
        </div>
      )}
    </div>
  );
}
