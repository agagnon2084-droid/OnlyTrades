"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function MessageButton({ userId, username }: { userId: string; username: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/messages/${data.conversation.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "FAILED");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-4 py-2 text-xs font-mono tracking-widest border border-[var(--border-raw)] text-[var(--text-dim)] hover:border-[var(--accent-static)] hover:text-[var(--accent-static)] transition-all duration-[80ms] disabled:opacity-30"
    >
      {loading ? "_" : "// MSG"}
    </button>
  );
}
