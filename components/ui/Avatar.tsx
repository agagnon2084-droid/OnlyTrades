import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  online?: boolean;
  className?: string;
}

const sizes = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-xl",
};

export default function Avatar({ src, name, size = "md", online, className }: AvatarProps) {
  const initials = name ? getInitials(name) : "?";
  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <div className={cn(
        "relative overflow-hidden bg-[var(--bg-elevated)] flex items-center justify-center font-mono font-semibold text-[var(--accent-acid)] border border-[var(--border-raw)]",
        "hover:border-[var(--accent-acid)] transition-colors duration-[80ms]",
        sizes[size]
      )}>
        {src ? (
          <Image src={src} alt={name || "User"} fill className="object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[var(--accent-acid)] border-2 border-[var(--bg-void)] online-dot" />
      )}
    </div>
  );
}
