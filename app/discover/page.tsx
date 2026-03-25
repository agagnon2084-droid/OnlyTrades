"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PostCard from "@/components/PostCard";
import { PostCardSkeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import { CATEGORIES, POST_TYPES } from "@/lib/constants";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  status: string;
  offerKeywords: string[];
  seekKeywords: string[];
  images: string[];
  estimatedValue?: number | null;
  createdAt: string;
  matchScore?: number;
  mutual?: boolean;
  user: { id: string; name: string | null; avatar: string | null };
}

type SortMode = "newest" | "best-match" | "oldest";

function DiscoverContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [isMatched, setIsMatched] = useState(false);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [sort, setSort] = useState<SortMode>("best-match");

  const fetchPosts = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (type) params.set("type", type);
      params.set("page", p.toString());
      params.set("limit", "12");

      const useDiscover = !search && !category && !type && sort === "best-match";
      const endpoint = useDiscover
        ? `/api/discover?${params}`
        : `/api/posts?${params}&sort=${sort === "oldest" ? "oldest" : "newest"}`;

      const res = await fetch(endpoint);
      const data = await res.json();
      setPosts(data.posts || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setIsMatched(data.isMatched || false);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, type, sort]);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts(1);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setType("");
    setSort("best-match");
    router.push("/discover");
  };

  const hasFilters = search || category || type;

  const sortTabs: { id: SortMode; label: string }[] = [
    { id: "newest", label: "NEWEST" },
    { id: "best-match", label: "BEST MATCH" },
    { id: "oldest", label: "MOST ACTIVE" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="text-[10px] font-mono tracking-widest text-[var(--accent-static)] mb-2">// MARKETPLACE</div>
        <h1 className="text-3xl font-display tracking-widest text-[var(--text-primary)]">DISCOVER TRADES</h1>
        <p className="text-xs font-mono text-[var(--text-dim)] mt-2">
          {isMatched
            ? "// PERSONALIZED MATCHES BASED ON YOUR SEEK KEYWORDS"
            : `// ${total.toLocaleString()} ACTIVE TRADE${total !== 1 ? "S" : ""} AVAILABLE`}
        </p>
      </div>

      {/* Search & filters */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="SEARCH THE MARKET_"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm font-mono border-0 border-b border-b-[var(--border-raw)] border-l-2 border-l-[var(--accent-acid)] placeholder:text-[var(--text-ghost)] placeholder:tracking-widest focus:outline-none focus:border-b-[var(--accent-acid)] focus:shadow-[0_1px_0_var(--accent-acid)] transition-all duration-[80ms]"
            />
          </div>
          <Button type="submit" size="md">SEARCH</Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <div className="flex-1 sm:flex-initial">
            <label className="block text-[10px] font-mono tracking-[0.1em] text-[var(--text-dim)] uppercase mb-1">CATEGORY</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full sm:w-auto appearance-none px-4 py-3 pr-10 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm font-mono border-0 border-b border-b-[var(--border-raw)] border-l-2 border-l-[var(--accent-acid)] focus:outline-none focus:border-b-[var(--accent-acid)] transition-all duration-[80ms]"
              >
                <option value="">ALL CATEGORIES</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.icon} {c.label.toUpperCase()}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--accent-acid)] text-xs pointer-events-none">▼</span>
            </div>
          </div>
          <div className="flex-1 sm:flex-initial">
            <label className="block text-[10px] font-mono tracking-[0.1em] text-[var(--text-dim)] uppercase mb-1">TYPE</label>
            <div className="relative">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full sm:w-auto appearance-none px-4 py-3 pr-10 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm font-mono border-0 border-b border-b-[var(--border-raw)] border-l-2 border-l-[var(--accent-acid)] focus:outline-none focus:border-b-[var(--accent-acid)] transition-all duration-[80ms]"
              >
                <option value="">ALL TYPES</option>
                {POST_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label.toUpperCase()}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--accent-acid)] text-xs pointer-events-none">▼</span>
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {search && (
              <span className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--accent-burn)] text-[var(--accent-burn)] text-xs font-label tracking-widest uppercase">
                &quot;{search}&quot;
                <button type="button" onClick={() => setSearch("")} className="hover:text-[var(--text-primary)] transition-colors">×</button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--accent-burn)] text-[var(--accent-burn)] text-xs font-label tracking-widest uppercase">
                {CATEGORIES.find(c => c.value === category)?.label}
                <button type="button" onClick={() => setCategory("")} className="hover:text-[var(--text-primary)] transition-colors">×</button>
              </span>
            )}
            {type && (
              <span className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--accent-burn)] text-[var(--accent-burn)] text-xs font-label tracking-widest uppercase">
                {POST_TYPES.find(t => t.value === type)?.label}
                <button type="button" onClick={() => setType("")} className="hover:text-[var(--text-primary)] transition-colors">×</button>
              </span>
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="text-[10px] font-mono tracking-widest text-[var(--text-dim)] hover:text-[var(--accent-acid)] transition-colors uppercase"
            >
              CLEAR ALL
            </button>
          </div>
        )}
      </form>

      {/* Sort tabs */}
      <div className="flex items-center gap-0 border-b border-[var(--border-raw)] mb-4">
        {sortTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSort(t.id)}
            className={`px-4 py-2 text-xs font-mono tracking-widest transition-all duration-[80ms] border-b-2 ${
              sort === t.id
                ? "text-[var(--accent-acid)] border-b-[var(--accent-acid)]"
                : "text-[var(--text-dim)] border-b-transparent hover:text-[var(--text-primary)]"
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="flex-1" />
        {!loading && (
          <span className="text-[10px] font-mono text-[var(--text-dim)] tracking-widest hidden sm:inline">
            // {total} RESULTS FOUND
          </span>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border-raw)]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-void)]">
              <PostCardSkeleton />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="text-4xl font-mono text-[var(--text-ghost)] mb-4">[ ]</div>
          <h3 className="text-sm font-mono tracking-widest uppercase text-[var(--text-dim)] mb-2">// NO RESULTS FOUND</h3>
          <p className="text-xs font-mono text-[var(--text-ghost)] max-w-sm mb-6 leading-relaxed">
            Try broader keywords or check back later. The market is always moving.
          </p>
          <div className="flex gap-3">
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters}>CLEAR FILTERS</Button>
            )}
            <Link href="/post/new">
              <Button>POST WHAT YOU NEED →</Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {isMatched && (
            <div className="flex items-center gap-2 mb-4 text-xs font-mono text-[var(--text-dim)]">
              <span className="text-[var(--accent-acid)]">✦</span>
              SORTED BY MATCH SCORE WITH YOUR ACTIVE POSTS
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border-raw)]">
            {posts.map((post) => (
              <div key={post.id} className="bg-[var(--bg-void)]">
                <PostCard
                  post={post}
                  matchScore={post.matchScore}
                  mutual={post.mutual}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                disabled={page <= 1}
                onClick={() => fetchPosts(page - 1)}
                className="px-4 py-2 text-xs font-mono tracking-widest border border-[var(--border-raw)] text-[var(--text-dim)] hover:border-[var(--accent-acid)] hover:text-[var(--accent-acid)] transition-all duration-[80ms] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← PREV
              </button>
              <span className="text-[10px] font-mono text-[var(--text-dim)] tracking-widest">
                // PAGE {page} OF {pages}
              </span>
              <button
                disabled={page >= pages}
                onClick={() => fetchPosts(page + 1)}
                className="px-4 py-2 text-xs font-mono tracking-widest border border-[var(--border-raw)] text-[var(--text-dim)] hover:border-[var(--accent-acid)] hover:text-[var(--accent-acid)] transition-all duration-[80ms] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                NEXT →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="skeleton h-8 w-48 mb-8" />
        <div className="card h-24 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border-raw)]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-void)]">
              <div className="card h-64 skeleton" />
            </div>
          ))}
        </div>
      </div>
    }>
      <DiscoverContent />
    </Suspense>
  );
}
