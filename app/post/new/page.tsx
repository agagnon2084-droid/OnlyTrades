"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TagInput from "@/components/TagInput";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { CATEGORIES, POST_TYPES } from "@/lib/constants";
import toast from "react-hot-toast";
import Link from "next/link";

interface Suggestion { keyword: string; count: number }

export default function NewPostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    type: "",
    estimatedValue: "",
  });
  const [offerKeywords, setOfferKeywords] = useState<string[]>([]);
  const [seekKeywords, setSeekKeywords] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [seekInput, setSeekInput] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Fetch keyword suggestions as user types seek keywords
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!seekInput || seekInput.length < 2) { setSuggestions([]); return; }
      try {
        const res = await fetch(`/api/keywords/suggestions?q=${encodeURIComponent(seekInput)}&limit=8`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch { setSuggestions([]); }
    };
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [seekInput]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.category) errs.category = "Category is required";
    if (!form.type) errs.type = "Type is required";
    if (offerKeywords.length === 0) errs.offerKeywords = "Add at least one offer keyword";
    if (seekKeywords.length === 0) errs.seekKeywords = "Add at least one seek keyword";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          offerKeywords,
          seekKeywords,
          images,
          estimatedValue: form.estimatedValue || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create post");
      toast.success("Trade post created!");
      router.push(`/post/${data.post.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display tracking-widest uppercase text-[var(--text-primary)] mb-1">Post a Trade</h1>
        <p className="text-[var(--text-dim)] text-sm">
          Describe what you&apos;re offering and what you&apos;d like in return.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Basic info */}
        <div className="card p-6 flex flex-col gap-5">
          <h2 className="font-semibold font-display tracking-widest uppercase text-[var(--text-primary)]">Basic Info</h2>
          <Input
            label="Title"
            placeholder="What are you trading? (e.g. 'Guitar lessons for website design')"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            error={errors.title}
          />
          <Textarea
            label="Description"
            placeholder="Describe what you're offering in detail. Include condition, your experience level, availability, etc."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            error={errors.description}
            rows={5}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--text-primary)]">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={`w-full px-3 py-2 border bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm appearance-none cursor-pointer focus:outline-none focus:border-[var(--accent-acid)] ${errors.category ? "border-red-500" : "border-[var(--border-raw)]"}`}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--text-primary)]">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={`w-full px-3 py-2 border bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm appearance-none cursor-pointer focus:outline-none focus:border-[var(--accent-acid)] ${errors.type ? "border-red-500" : "border-[var(--border-raw)]"}`}
              >
                <option value="">Select type</option>
                {POST_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
            </div>
          </div>
          <Input
            label="Estimated Value (optional)"
            type="number"
            placeholder="~$50 (for reference only — no money changes hands)"
            value={form.estimatedValue}
            onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })}
            hint="This helps others gauge the trade. It's never transactional."
          />
        </div>

        {/* Keywords */}
        <div className="card p-6 flex flex-col gap-5">
          <div>
            <h2 className="font-semibold font-display tracking-widest uppercase text-[var(--text-primary)] mb-0.5">Keywords</h2>
            <p className="text-xs text-[var(--text-dim)]">
              Keywords power the matching engine. Be specific — &quot;acoustic guitar&quot; beats &quot;music&quot;.
            </p>
          </div>
          <TagInput
            label="What you're offering"
            placeholder="e.g. guitar lessons, web design, sourdough bread..."
            value={offerKeywords}
            onChange={setOfferKeywords}
            variant="offer"
            hint="Press Enter or comma to add. Up to 10 tags."
          />
          {errors.offerKeywords && <p className="text-xs text-red-500 -mt-3">{errors.offerKeywords}</p>}

          <div>
            <TagInput
              label="What you're seeking"
              placeholder="Type to see what others are offering..."
              value={seekKeywords}
              onChange={setSeekKeywords}
              variant="seek"
              hint="Keywords others are currently offering will be suggested below."
            />
            {errors.seekKeywords && <p className="text-xs text-red-500">{errors.seekKeywords}</p>}

            {/* Keyword suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-[var(--text-dim)] mb-1.5">
                  Popular offers in the community — click to add:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions
                    .filter((s) => !seekKeywords.includes(s.keyword))
                    .map((s) => (
                      <button
                        key={s.keyword}
                        type="button"
                        onClick={() => setSeekKeywords([...seekKeywords, s.keyword])}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full tag-seek hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        {s.keyword}
                        <span className="opacity-60">({s.count})</span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Hidden input to trigger suggestions */}
            <input
              type="text"
              className="sr-only"
              value={seekInput}
              onChange={(e) => setSeekInput(e.target.value)}
              onFocus={() => setSeekInput("")}
            />
            <p className="text-xs text-[var(--text-dim)] mt-1">
              Start typing seek keywords above to see community suggestions.{" "}
              <button
                type="button"
                className="text-[var(--accent-acid)] hover:underline"
                onClick={async () => {
                  const res = await fetch("/api/keywords/suggestions?limit=12");
                  const data = await res.json();
                  setSuggestions(data.suggestions || []);
                }}
              >
                Show top keywords →
              </button>
            </p>
          </div>
        </div>

        {/* Images */}
        <div className="card p-6 flex flex-col gap-4">
          <div>
            <h2 className="font-semibold font-display tracking-widest uppercase text-[var(--text-primary)] mb-0.5">Images (optional)</h2>
            <p className="text-xs text-[var(--text-dim)]">Add image URLs. Up to 5 images.</p>
          </div>
          {images.length < 5 && (
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (imageInput.trim()) {
                      setImages([...images, imageInput.trim()]);
                      setImageInput("");
                    }
                  }
                }}
                className="flex-1 px-3 py-2 border border-[var(--border-raw)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-acid)]"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (imageInput.trim()) {
                    setImages([...images, imageInput.trim()]);
                    setImageInput("");
                  }
                }}
              >
                Add
              </Button>
            </div>
          )}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-16 w-16 object-cover border border-[var(--border-raw)]" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <Link href="/discover">
            <Button type="button" variant="ghost">Cancel</Button>
          </Link>
          <Button type="submit" size="lg" loading={loading}>
            Post Trade
          </Button>
        </div>
      </form>
    </div>
  );
}
