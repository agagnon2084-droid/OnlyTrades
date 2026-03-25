"use client";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Modal({ open, onClose, title, children, size = "md", className }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--bg-void)]/80 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "relative w-full bg-[var(--bg-surface)] border border-[var(--border-raw)] border-l-2 border-l-[var(--accent-acid)] shadow-[0_0_40px_rgba(200,255,0,0.1)]",
        sizes[size],
        className
      )}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-raw)]">
            <h2 className="text-sm font-display tracking-widest uppercase text-[var(--accent-acid)]">// {title}</h2>
            <button onClick={onClose} className="text-[var(--text-dim)] hover:text-[var(--accent-burn)] transition-colors font-mono text-lg leading-none">×</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
