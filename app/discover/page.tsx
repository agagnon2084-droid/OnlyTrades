"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PostCard from "@/components/PostCard";
import { PostCardSkeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import EmptyState from "@/components/EmptyState";
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

const SORT_OPTIONS = [
  { value: "best-match", label: "Best Match" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

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
  const [sort, setSort] = useState("best-match");

  const fetchPosts = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (type) params.set("type", type);
      params.set("page", p.toString());
      params.set("limit", "12");

      // Use discover endpoint for matching, posts endpoint for search/filter
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-1">Discover Trades</h1>
        <p className="text-[var(--muted-foreground)] text-sm">
          {isMatched
            ? "Personalized matches based on your seek keywords"
            : `${total.toLocaleString()} active trade${total !== 1 ? "s" : ""} available`}
        </p>
      </div>

      {/* Search & filters */}
      <form onSubmit={handleSearch} className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by title, description, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
            />
          </div>
          <Button type="submit" size="md">Search</Button>
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] appearance-none cursor-pointer"
          >
            <option value="">All Types</option>
            {POST_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Clear filters ×
            </button>
          )}
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No trades found"
          description={
            hasFilters
              ? "Try adjusting your filters or search terms."
              : "Be the first to post a trade!"
          }
          action={
            <Link href="/post/new">
              <Button>Post a Trade</Button>
            </Link>
          }
        />
      ) : (
        <>
          {isMatched && (
            <div className="flex items-center gap-2 mb-4 text-sm text-[var(--muted-foreground)]">
              <span className="text-green-600">✦</span>
              Sorted by match score with your active posts
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                matchScore={post.matchScore}
                mutual={post.mutual}
              />
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => fetchPosts(page - 1)}
              >
                ← Prev
              </Button>
              <span className="text-sm text-[var(--muted-foreground)] px-2">
                Page {page} of {pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pages}
                onClick={() => fetchPosts(page + 1)}
              >
                Next →
              </Button>
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-64 skeleton" />
          ))}
        </div>
      </div>
    }>
      <DiscoverContent />
    </Suspense>
  );
}
