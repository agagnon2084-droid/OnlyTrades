"use client";
import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { PostCardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/EmptyState";
import toast from "react-hot-toast";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

interface Post {
  id: string;
  title: string;
  category: string;
  images: string[];
  offerKeywords: string[];
}

interface ProposeTradeButtonProps {
  requestedPostId: string;
  requestedPostTitle: string;
}

export default function ProposeTradeButton({ requestedPostId, requestedPostTitle }: ProposeTradeButtonProps) {
  const [open, setOpen] = useState(false);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string>("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/posts?userId=me&status=ACTIVE&limit=50")
      .then((r) => r.json())
      .then((d) => setMyPosts(d.posts || []))
      .catch(() => setMyPosts([]))
      .finally(() => setLoading(false));
  }, [open]);

  const handleSubmit = async () => {
    if (!selected) { toast.error("Select a post to offer"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offeredPostId: selected, requestedPostId, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Trade request sent!");
      setOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button className="w-full" onClick={() => setOpen(true)}>
        Propose a Trade
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Propose a Trade" size="lg">
        <div className="flex flex-col gap-5">
          <div className="px-3 py-2.5 bg-[var(--bg-elevated)] text-sm text-[var(--text-dim)]">
            You&apos;re offering one of your posts in exchange for:{" "}
            <strong className="text-[var(--text-primary)]">{requestedPostTitle}</strong>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          ) : myPosts.length === 0 ? (
            <EmptyState
              icon="📝"
              title="No active posts"
              description="You need an active post to propose a trade."
              action={
                <Link href="/post/new">
                  <Button size="sm">Create a Post</Button>
                </Link>
              }
            />
          ) : (
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-3">
                Select which of your posts to offer:
              </p>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {myPosts.map((post) => {
                  const cat = CATEGORIES.find((c) => c.value === post.category);
                  return (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => setSelected(post.id)}
                      className={`text-left p-3 border-2 transition-all ${
                        selected === post.id
                          ? "border-[var(--accent-acid)] bg-[var(--bg-elevated)]"
                          : "border-[var(--border-raw)] hover:border-[var(--accent-acid)]/50"
                      }`}
                    >
                      <div className="text-lg mb-1">{cat?.icon ?? "📦"}</div>
                      <p className="text-xs font-medium text-[var(--text-primary)] line-clamp-2">
                        {post.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and explain why this is a great trade..."
              rows={3}
              className="w-full px-3 py-2 border border-[var(--border-raw)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm resize-none focus:outline-none focus:border-[var(--accent-acid)]"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-[var(--border-raw)]">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              loading={submitting}
              disabled={!selected || myPosts.length === 0}
            >
              Send Trade Request
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
