import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-mono tracking-widest uppercase text-[var(--accent-static)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3 py-2 bg-[var(--bg-surface)] border text-[var(--text-primary)] font-mono text-sm placeholder:text-[var(--text-ghost)] resize-none",
            "focus:outline-none transition-all duration-[80ms]",
            error
              ? "border-[var(--accent-burn)]"
              : "border-[var(--border-raw)] focus:border-[var(--accent-acid)]",
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
Textarea.displayName = "Textarea";
export default Textarea;
