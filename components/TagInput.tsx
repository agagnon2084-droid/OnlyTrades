"use client";
import { useState, KeyboardEvent } from "react";
import Badge from "@/components/ui/Badge";
import { MAX_KEYWORDS } from "@/lib/constants";

interface TagInputProps {
  label?: string;
  placeholder?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  variant?: "offer" | "seek";
  max?: number;
  hint?: string;
  error?: string;
}

export default function TagInput({
  label, placeholder, value, onChange, variant = "offer", max = MAX_KEYWORDS, hint, error,
}: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed || value.includes(trimmed) || value.length >= max) return;
    onChange([...value, trimmed]);
    setInput("");
  };

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(input); }
    if (e.key === "Backspace" && !input && value.length > 0) onChange(value.slice(0, -1));
  };

  const labelColor = variant === "offer" ? "text-[var(--accent-acid)]" : "text-[var(--accent-burn)]";
  const borderColor = error
    ? "border-[var(--accent-burn)]"
    : variant === "offer"
    ? "border-[var(--border-raw)] focus-within:border-[var(--accent-acid)]"
    : "border-[var(--border-raw)] focus-within:border-[var(--accent-burn)]";

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className={`text-xs font-mono tracking-widest uppercase ${labelColor}`}>
          {label}
          <span className="ml-1 text-[var(--text-ghost)] normal-case tracking-normal">
            [{value.length}/{max}]
          </span>
        </label>
      )}
      <div className={`min-h-[44px] flex flex-wrap gap-1.5 items-center px-3 py-2 bg-[var(--bg-surface)] border transition-all duration-[80ms] ${borderColor}`}>
        {value.map((tag) => (
          <Badge key={tag} variant={variant} onRemove={() => removeTag(tag)}>{tag}</Badge>
        ))}
        {value.length < max && (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => input && addTag(input)}
            placeholder={value.length === 0 ? placeholder : "add more..."}
            className="flex-1 min-w-[120px] bg-transparent text-sm font-mono outline-none text-[var(--text-primary)] placeholder:text-[var(--text-ghost)]"
          />
        )}
      </div>
      {error && <p className="text-xs font-mono text-[var(--accent-burn)]">// {error}</p>}
      {hint && !error && <p className="text-xs font-mono text-[var(--text-ghost)]">// {hint}</p>}
    </div>
  );
}
