import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-mono font-medium tracking-widest uppercase transition-all duration-[80ms] disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-[var(--accent-acid)] border";

    const variants = {
      primary: "bg-transparent border-[var(--accent-acid)] text-[var(--accent-acid)] hover:bg-[var(--accent-acid)] hover:text-[var(--bg-void)]",
      secondary: "bg-transparent border-[var(--border-raw)] text-[var(--text-dim)] hover:border-[var(--accent-acid)] hover:text-[var(--accent-acid)]",
      ghost: "border-transparent text-[var(--text-dim)] hover:text-[var(--text-primary)] bg-transparent",
      danger: "bg-transparent border-[var(--accent-burn)] text-[var(--accent-burn)] hover:bg-[var(--accent-burn)] hover:text-[var(--bg-void)]",
      outline: "bg-transparent border-[var(--border-raw)] text-[var(--text-primary)] hover:border-[var(--accent-acid)] hover:text-[var(--accent-acid)]",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-xs px-4 py-2 gap-2",
      lg: "text-sm px-6 py-3 gap-2",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <span className="blink">_</span> : children}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
