"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Avatar from "@/components/ui/Avatar";

interface MobileNavProps {
  session: any;
  unread: number;
}

export default function MobileNav({ session, unread }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, close]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex md:hidden flex-col items-center justify-center w-10 h-10 gap-[5px]"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <span
          className="block h-[2px] w-5 transition-all duration-200 origin-center"
          style={{
            backgroundColor: "var(--accent-acid)",
            transform: open ? "translateY(3.5px) rotate(45deg)" : "none",
          }}
        />
        <span
          className="block h-[2px] w-5 transition-all duration-200"
          style={{
            backgroundColor: "var(--accent-acid)",
            opacity: open ? 0 : 1,
          }}
        />
        <span
          className="block h-[2px] w-5 transition-all duration-200 origin-center"
          style={{
            backgroundColor: "var(--accent-acid)",
            transform: open ? "translateY(-3.5px) rotate(-45deg)" : "none",
          }}
        />
        {/* Unread indicator on hamburger */}
        {unread > 0 && !open && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--accent-acid)]" />
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 md:hidden"
          onClick={close}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col md:hidden"
        style={{
          backgroundColor: "var(--bg-void)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 200ms ease-out",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--border-raw)]">
          <Link
            href="/"
            onClick={close}
            className="flex items-center gap-2 font-display text-lg tracking-widest text-[var(--text-primary)]"
          >
            <span className="text-[var(--accent-acid)]">⌬</span>
            <span>ONLYTRADES</span>
          </Link>
          <button
            onClick={close}
            className="text-[var(--accent-acid)] text-xl leading-none font-mono"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* User info */}
        {session?.user && (
          <div className="px-5 py-4 border-b border-[var(--border-raw)] flex items-center gap-3">
            <Avatar
              src={session.user.image}
              name={session.user.name || "?"}
              size="sm"
            />
            <div className="min-w-0">
              <div className="text-sm font-mono text-[var(--text-primary)] truncate">
                {session.user.name}
              </div>
              {session.user.username && (
                <div className="text-[10px] font-mono text-[var(--accent-static)]">
                  @{session.user.username}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-2">
          {session ? (
            <>
              <NavLink href="/discover" onClick={close}>DISCOVER</NavLink>
              <NavLink href="/feed" onClick={close}>FEED</NavLink>
              <NavLink href="/messages" onClick={close}>
                MESSAGES
                {unread > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-[9px] font-mono bg-[var(--accent-acid)] text-[var(--bg-void)]">
                    {unread}
                  </span>
                )}
              </NavLink>
              <NavLink href="/post/new" onClick={close}>+ NEW TRADE</NavLink>
              <NavLink href={`/u/${session.user?.id}`} onClick={close}>PROFILE</NavLink>
              <NavLink href="/settings" onClick={close}>SETTINGS</NavLink>
              <div className="border-t border-[var(--border-raw)] mt-2 pt-2">
                <button
                  onClick={() => {
                    close();
                    signOut();
                  }}
                  className="w-full text-left px-5 py-3 min-h-[48px] flex items-center text-xs font-mono tracking-widest text-[var(--accent-burn)] hover:bg-[var(--bg-elevated)] transition-colors duration-[80ms]"
                >
                  SIGN OUT
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink href="/discover" onClick={close}>DISCOVER</NavLink>
              <NavLink href="/members" onClick={close}>MEMBERS</NavLink>
              <div className="border-t border-[var(--border-raw)] mt-2 pt-2 px-5 flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={close}
                  className="block w-full text-center px-4 py-3 text-xs font-mono tracking-widest border border-[var(--border-raw)] text-[var(--text-dim)] hover:border-[var(--accent-acid)] hover:text-[var(--accent-acid)] transition-all duration-[80ms]"
                >
                  SIGN IN
                </Link>
                <Link
                  href="/signup"
                  onClick={close}
                  className="block w-full text-center px-4 py-3 text-xs font-mono tracking-widest border border-[var(--accent-acid)] text-[var(--accent-acid)] hover:bg-[var(--accent-acid)] hover:text-[var(--bg-void)] transition-all duration-[80ms]"
                >
                  JOIN
                </Link>
              </div>
            </>
          )}
        </nav>

        {/* Footer tagline */}
        <div className="px-5 py-4 border-t border-[var(--border-raw)]">
          <p className="text-[10px] font-mono text-[var(--text-ghost)] tracking-widest">
            TRADE EVERYTHING. OWE NOTHING.
          </p>
        </div>
      </div>
    </>
  );
}

function NavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center px-5 py-3 min-h-[48px] text-xs font-mono tracking-widest text-[var(--text-dim)] hover:text-[var(--accent-acid)] hover:bg-[var(--bg-elevated)] transition-all duration-[80ms]"
    >
      {children}
    </Link>
  );
}
