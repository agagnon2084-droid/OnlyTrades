export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--background)]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
            <span className="text-3xl">🌿</span>
            <span>OnlyTrades</span>
          </a>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Trade without money. Always.</p>
        </div>
        {children}
      </div>
    </div>
  );
}
