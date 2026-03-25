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
