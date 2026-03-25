"use client";
interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({ value, onChange, max = 5, size = "md" }: StarRatingProps) {
  const sizes = { sm: "text-sm", md: "text-lg", lg: "text-2xl" };
  return (
    <div className={`flex gap-0.5 font-mono ${sizes[size]}`}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={`leading-none transition-colors duration-[80ms] ${onChange ? "cursor-crosshair" : "cursor-default"} ${star <= Math.round(value) ? "text-[var(--accent-acid)]" : "text-[var(--text-ghost)]"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
