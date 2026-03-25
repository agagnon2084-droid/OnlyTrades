export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PostCard from "@/components/PostCard";
import { CATEGORIES } from "@/lib/constants";

async function getRecentPosts() {
  return prisma.post.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { user: { select: { id: true, name: true, avatar: true, username: true } } },
  });
}

async function getStats() {
  const [postCount, userCount, tradeCount] = await Promise.all([
    prisma.post.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
    prisma.tradeRequest.count({ where: { status: "COMPLETED" } }),
  ]);
  return { postCount, userCount, tradeCount };
}

export default async function HomePage() {
  const [posts, stats] = await Promise.all([getRecentPosts(), getStats()]);

  const tickerItems = [
    `${stats.postCount} ACTIVE TRADES`,
    `${stats.userCount} MEMBERS`,
    `${stats.tradeCount} COMPLETED DEALS`,
    "NO MONEY CHANGES HANDS",
    "PEER TO PEER",
    "ANTI-CORPORATE",
    "TRADE EVERYTHING",
  ];

  return (
    <main className="flex flex-col">
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center radar-grid overflow-hidden border-b border-[var(--border-raw)]">
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[var(--bg-void)]" />
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="mb-6 inline-flex items-center gap-3 text-[10px] font-mono tracking-widest text-[var(--text-ghost)] border border-[var(--border-raw)] px-4 py-2">
            <span className="text-[var(--accent-acid)] online-dot">◉</span>
            SYSTEM ONLINE // {stats.postCount} ACTIVE TRADES // {stats.userCount} MEMBERS
          </div>

          <h1
            className="glitch text-6xl md:text-8xl font-display font-black tracking-tight text-[var(--text-primary)] leading-none mb-4"
            data-text="TRADE EVERYTHING."
          >
            TRADE EVERYTHING.
          </h1>
          <h2 className="text-4xl md:text-6xl font-display font-black tracking-tight text-[var(--accent-acid)] leading-none mb-8">
            OWE NOTHING.
          </h2>

          <p className="text-sm font-mono text-[var(--text-dim)] max-w-xl mx-auto mb-10 leading-loose">
            Underground peer-to-peer barter economy. Skills, items, experiences, expertise.<br />
            No money. No fees. No middlemen. Ever.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="px-8 py-3 text-sm font-mono tracking-widest border border-[var(--accent-acid)] text-[var(--accent-acid)] hover:bg-[var(--accent-acid)] hover:text-[var(--bg-void)] transition-all duration-[80ms] uppercase">
              JOIN THE COLLECTIVE
            </Link>
            <Link href="/discover" className="px-8 py-3 text-sm font-mono tracking-widest border border-[var(--border-raw)] text-[var(--text-dim)] hover:border-[var(--accent-acid)] hover:text-[var(--accent-acid)] transition-all duration-[80ms] uppercase">
              BROWSE TRADES
            </Link>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-4 left-4 text-[10px] font-mono text-[var(--text-ghost)]">v2.0.0</div>
        <div className="absolute top-4 right-4 text-[10px] font-mono text-[var(--text-ghost)]">EST. 2024</div>
        <div className="absolute bottom-4 left-4 text-[10px] font-mono text-[var(--text-ghost)]">SYS: NOMINAL</div>
        <div className="absolute bottom-4 right-4 text-[10px] font-mono text-[var(--accent-acid)] blink">_</div>
      </section>

      {/* ── TICKER TAPE ───────────────────────────────────────── */}
      <div className="border-b border-[var(--border-raw)] bg-[var(--bg-surface)] py-2 overflow-hidden">
        <div className="ticker-inner gap-8">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="text-[10px] font-mono tracking-widest text-[var(--text-dim)] px-8">
              <span className="text-[var(--accent-acid)]">⌬</span> {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-20 w-full">
        <div className="mb-12">
          <div className="text-[10px] font-mono tracking-widest text-[var(--accent-static)] mb-2">// PROTOCOL</div>
          <h2 className="text-3xl font-display tracking-widest text-[var(--text-primary)]">HOW IT WORKS</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-px bg-[var(--border-raw)]">
          {[
            { step: "01", title: "POST YOUR OFFER", desc: "List what you have. Tag what you'd want in return. The engine does the matching." },
            { step: "02", title: "GET MATCHED", desc: "Keyword overlap surfaces mutual matches first. Both sides benefit equally or nothing moves." },
            { step: "03", title: "EXECUTE THE TRADE", desc: "Propose, agree, swap. Mark complete. Leave a rep score. Build your collective standing." },
          ].map((item) => (
            <div key={item.step} className="bg-[var(--bg-surface)] p-8 hover:bg-[var(--bg-elevated)] transition-colors duration-[80ms]">
              <div className="text-5xl font-display text-[var(--text-ghost)] mb-4">{item.step}</div>
              <h3 className="text-sm font-mono tracking-widest text-[var(--accent-acid)] mb-3">{item.title}</h3>
              <p className="text-xs font-mono text-[var(--text-dim)] leading-loose">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────── */}
      <section className="border-t border-[var(--border-raw)] bg-[var(--bg-surface)]">
        <div className="max-w-6xl mx-auto px-4 py-16 w-full">
          <div className="mb-10">
            <div className="text-[10px] font-mono tracking-widest text-[var(--accent-static)] mb-2">// CATEGORIES</div>
            <h2 className="text-3xl font-display tracking-widest text-[var(--text-primary)]">WHAT CAN BE TRADED</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-px bg-[var(--border-raw)]">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/discover?category=${cat.value}`}
                className="bg-[var(--bg-surface)] flex flex-col items-center gap-2 p-5 text-center hover:bg-[var(--bg-elevated)] hover:border-[var(--accent-acid)] group transition-all duration-[80ms]"
              >
                <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{cat.icon}</span>
                <span className="text-[10px] font-mono tracking-widest text-[var(--text-ghost)] group-hover:text-[var(--accent-acid)] uppercase transition-colors">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENT POSTS ──────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-20 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-[var(--accent-static)] mb-2">// LIVE FEED</div>
            <h2 className="text-3xl font-display tracking-widest text-[var(--text-primary)]">LATEST TRADES</h2>
          </div>
          <Link href="/discover" className="text-xs font-mono tracking-widest text-[var(--accent-acid)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border-raw)] px-4 py-2 hover:border-[var(--accent-acid)]">
            ALL TRADES →
          </Link>
        </div>
        {posts.length === 0 ? (
          <div className="text-center py-20 font-mono text-[var(--text-ghost)] text-sm">
            // NO ACTIVE TRADES YET. <Link href="/signup" className="text-[var(--accent-acid)] hover:underline">BE FIRST.</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border-raw)]">
            {posts.map((post) => (
              <div key={post.id} className="bg-[var(--bg-void)]">
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="border-t border-[var(--border-raw)] bg-[var(--bg-surface)]">
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="text-[10px] font-mono tracking-widest text-[var(--accent-static)] mb-4">// JOIN THE COLLECTIVE</div>
          <h2 className="text-5xl font-display font-black tracking-widest text-[var(--text-primary)] mb-4">
            THE ECONOMY<br />
            <span className="text-[var(--accent-acid)]">IS BROKEN.</span>
          </h2>
          <p className="text-sm font-mono text-[var(--text-dim)] mb-10 max-w-lg mx-auto leading-loose">
            {stats.userCount} people already trading outside the system.<br />
            No money changes hands. Ever.
          </p>
          <Link href="/signup" className="inline-block px-12 py-4 text-sm font-mono font-bold tracking-widest border-2 border-[var(--accent-acid)] text-[var(--accent-acid)] hover:bg-[var(--accent-acid)] hover:text-[var(--bg-void)] transition-all duration-[80ms] uppercase">
            ENTER THE SYSTEM
          </Link>
        </div>
      </section>
    </main>
  );
}
