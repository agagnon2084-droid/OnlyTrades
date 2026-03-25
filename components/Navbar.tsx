"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Avatar from "@/components/ui/Avatar";
import MobileNav from "@/components/MobileNav";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/notifications").then(r => r.json()).then(d => setUnread(d.unreadCount || 0)).catch(() => {});
  }, [session?.user?.id]);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[var(--bg-void)] border-b border-[var(--border-raw)]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-display text-lg tracking-widest text-[var(--text-primary)] hover:text-[var(--accent-acid)] transition-colors duration-[80ms]">
            <span className="text-[var(--accent-acid)]">⌬</span>
            <span>ONLYTRADES</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-0">
            {[
              { href: "/discover", label: "DISCOVER" },
              { href: "/members", label: "MEMBERS" },
              ...(session ? [
                { href: "/feed", label: "FEED" },
                { href: "/messages", label: unread > 0 ? `MSG [${unread}]` : "MSG" },
                { href: "/post/new", label: "+ TRADE" },
              ] : []),
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-1 text-xs font-mono tracking-widest text-[var(--text-dim)] hover:text-[var(--accent-acid)] transition-colors duration-[80ms] relative group"
              >
                {item.label}
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--accent-acid)] opacity-0 group-hover:opacity-100 blink">_</span>
              </Link>
            ))}
          </div>

          {/* Mobile Nav */}
          <MobileNav session={session} unread={unread} />

          {/* Auth */}
          <div className="flex items-center gap-2">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-2 py-1 border border-transparent hover:border-[var(--border-raw)] transition-all duration-[80ms]"
                >
                  <Avatar src={session.user?.image} name={session.user?.name || "?"} size="sm" />
                  <span className="hidden sm:block text-xs font-mono text-[var(--text-dim)] hover:text-[var(--accent-acid)] transition-colors">
                    {session.user?.name?.split(" ")[0]?.toUpperCase()}
                  </span>
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-12 z-20 w-48 bg-[var(--bg-surface)] border border-[var(--border-raw)] border-l-2 border-l-[var(--accent-acid)]">
                      {[
                        { href: `/u/${session.user?.id}`, label: "// PROFILE" },
                        { href: "/dashboard", label: "// DASHBOARD" },
                        { href: "/settings", label: "// SETTINGS" },
                      ].map(item => (
                        <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                          className="block px-4 py-2.5 text-xs font-mono text-[var(--text-dim)] hover:text-[var(--accent-acid)] hover:bg-[var(--bg-elevated)] transition-all duration-[80ms]">
                          {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-[var(--border-raw)]" />
                      <button onClick={() => { setMenuOpen(false); signOut(); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-mono text-[var(--accent-burn)] hover:bg-[var(--bg-elevated)] transition-all duration-[80ms]">
                        // DISCONNECT
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-3 py-1.5 text-xs font-mono tracking-widest text-[var(--text-dim)] hover:text-[var(--accent-acid)] transition-colors">
                  LOGIN
                </Link>
                <Link href="/signup" className="px-3 py-1.5 text-xs font-mono tracking-widest border border-[var(--accent-acid)] text-[var(--accent-acid)] hover:bg-[var(--accent-acid)] hover:text-[var(--bg-void)] transition-all duration-[80ms]">
                  JOIN
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
