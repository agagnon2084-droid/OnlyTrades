import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Toaster from "@/components/Toaster";

export const metadata: Metadata = {
  title: "ONLYTRADES — TRADE EVERYTHING. OWE NOTHING.",
  description: "Underground peer-to-peer barter economy. No money. No fees. No middlemen.",
  keywords: ["barter", "trade", "cashless", "peer-to-peer", "skills", "swap"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=IBM+Plex+Mono:wght@300;400;500;600&family=Bebas+Neue&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-void)] text-[var(--text-primary)]">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-[var(--border-raw)] py-6 mt-auto">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-mono text-[var(--text-ghost)] tracking-widest">
                <span className="text-[var(--accent-acid)]">⌬</span> ONLYTRADES // TRADE EVERYTHING. OWE NOTHING.
              </span>
              <div className="flex gap-6">
                {["/discover", "/members", "/post/new"].map((href) => (
                  <a key={href} href={href} className="text-[10px] font-mono tracking-widest text-[var(--text-ghost)] hover:text-[var(--accent-acid)] transition-colors uppercase">
                    {href.replace("/", "")}
                  </a>
                ))}
              </div>
            </div>
          </footer>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
