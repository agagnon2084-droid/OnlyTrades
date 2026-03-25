import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "offer" | "seek" | "matched" | "category" | "status-active" | "status-pending" | "status-traded";
  className?: string;
  onRemove?: () => void;
}

export default function Badge({ children, variant = "default", className, onRemove }: BadgeProps) {
  const variants = {
    default: "border border-[var(--border-raw)] text-[var(--text-dim)]",
    offer: "tag-offer",
    seek: "tag-seek",
    matched: "tag-matched",
    category: "border border-[var(--border-raw)] text-[var(--text-dim)] font-[\'Bebas_Neue\'] tracking-wider",
    "status-active": "border border-[var(--accent-acid)] text-[var(--accent-acid)]",
    "status-pending": "border border-amber-500 text-amber-500",
    "status-traded": "border border-[var(--text-ghost)] text-[var(--text-ghost)]",
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5",
      variants[variant],
      className
    )}>
      {children}
      {onRemove && (
        <button onClick={onRemove} type="button" className="ml-0.5 hover:text-[var(--accent-burn)] transition-colors leading-none">
          ×
        </button>
      )}
    </span>
  );
}
