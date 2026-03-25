"use client";
import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import StarRating from "@/components/ui/StarRating";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ReviewModalProps {
  tradeRequestId: string;
  revieweeId: string;
  revieweeName: string;
}

export default function ReviewModal({ tradeRequestId, revieweeId, revieweeName }: ReviewModalProps) {
  const [open, setOpen] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (rating === 0) { toast.error("Please select a rating"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeRequestId, rating, comment }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      toast.success("Review submitted!");
      setOpen(false);
      router.replace(`/profile/${revieweeId}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={() => { setOpen(false); router.replace(`/profile/${revieweeId}`); }} title={`Review ${revieweeName}`}>
      <div className="flex flex-col gap-5">
        <p className="text-sm text-[var(--text-dim)]">
          How was your trade experience with <strong className="text-[var(--text-primary)]">{revieweeName}</strong>?
        </p>
        <div className="flex flex-col items-center gap-2">
          <StarRating value={rating} onChange={setRating} size="lg" />
          <p className="text-sm text-[var(--text-dim)]">
            {rating === 0 ? "Select a rating" : ["", "Poor", "Fair", "Good", "Great", "Excellent!"][rating]}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[var(--text-primary)]">Comment (optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe your experience..."
            rows={4}
            className="w-full px-3 py-2 border border-[var(--border-raw)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm resize-none focus:outline-none focus:border-[var(--accent-acid)]"
          />
        </div>
        <div className="flex gap-3 justify-end pt-2 border-t border-[var(--border-raw)]">
          <Button variant="ghost" onClick={() => { setOpen(false); router.replace(`/profile/${revieweeId}`); }}>Skip</Button>
          <Button onClick={handleSubmit} loading={submitting} disabled={rating === 0}>Submit Review</Button>
        </div>
      </div>
    </Modal>
  );
}
