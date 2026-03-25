import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-mono tracking-widest uppercase text-[var(--accent-static)] small-caps">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-0 py-2 bg-transparent border-0 border-b text-[var(--text-primary)] font-mono text-sm placeholder:text-[var(--text-ghost)]",
            "focus:outline-none transition-all duration-[80ms]",
            error
              ? "border-b-[var(--accent-burn)] focus:border-b-[var(--accent-burn)]"
              : "border-b-[var(--border-raw)] focus:border-b-[var(--accent-acid)] focus:shadow-[0_2px_0_0_rgba(200,255,0,0.3)]",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs font-mono text-[var(--accent-burn)]">// {error}</p>}
        {hint && !error && <p className="text-xs font-mono text-[var(--text-ghost)]">// {hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
