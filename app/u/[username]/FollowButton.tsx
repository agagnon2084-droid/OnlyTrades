"use client";
import { useState } from "react";
import toast from "react-hot-toast";

export default function FollowButton({ userId, initialFollowing }: { userId: string; initialFollowing: boolean }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: following ? "DELETE" : "POST",
      });
      if (!res.ok) throw new Error();
      setFollowing(!following);
      toast.success(following ? "UNFOLLOWED" : "FOLLOWING");
    } catch {
      toast.error("ACTION FAILED");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-4 py-2 text-xs font-mono tracking-widest border transition-all duration-[80ms] disabled:opacity-30 ${
        following
          ? "border-[var(--border-raw)] text-[var(--text-dim)] hover:border-[var(--accent-burn)] hover:text-[var(--accent-burn)]"
          : "border-[var(--accent-acid)] text-[var(--accent-acid)] hover:bg-[var(--accent-acid)] hover:text-[var(--bg-void)]"
      }`}
    >
      {loading ? "_" : following ? "FOLLOWING ✓" : "+ FOLLOW"}
    </button>
  );
}
