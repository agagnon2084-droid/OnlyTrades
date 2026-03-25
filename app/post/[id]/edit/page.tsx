"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TagInput from "@/components/TagInput";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { CATEGORIES, POST_TYPES, POST_STATUSES } from "@/lib/constants";
import toast from "react-hot-toast";
import Link from "next/link";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [postId, setPostId] = useState<string>("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    type: "",
    status: "",
    estimatedValue: "",
  });
  const [offerKeywords, setOfferKeywords] = useState<string[]>([]);
  const [seekKeywords, setSeekKeywords] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    params.then(({ id }) => setPostId(id));
  }, [params]);

  useEffect(() => {
    if (!postId) return;
    fetch(`/api/posts/${postId}`)
      .then((r) => r.json())
      .then(({ post }) => {
        if (!post) { router.push("/dashboard"); return; }
        setForm({
          title: post.title,
          description: post.description,
          category: post.category,
          type: post.type,
          status: post.status,
          estimatedValue: post.estimatedValue?.toString() || "",
        });
        setOfferKeywords(post.offerKeywords);
        setSeekKeywords(post.seekKeywords);
        setImages(post.images);
      })
      .finally(() => setLoading(false));
  }, [postId, router]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, offerKeywords, seekKeywords, images }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Post updated!");
      router.push(`/post/${postId}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Remove this post? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      toast.success("Post removed");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to remove post");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="skeleton h-8 w-48 mb-8" />
        <div className="card p-6 flex flex-col gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-10 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display tracking-widest uppercase text-[var(--text-primary)] mb-1">Edit Post</h1>
        <p className="text-[var(--text-dim)] text-sm">Update your trade listing.</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="card p-6 flex flex-col gap-5">
          <h2 className="font-semibold font-display tracking-widest uppercase text-[var(--text-primary)]">Basic Info</h2>
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--text-primary)]">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-[var(--border-raw)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm appearance-none cursor-pointer focus:outline-none focus:border-[var(--accent-acid)]">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--text-primary)]">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-[var(--border-raw)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm appearance-none cursor-pointer focus:outline-none focus:border-[var(--accent-acid)]">
                {POST_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--text-primary)]">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-[var(--border-raw)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm appearance-none cursor-pointer focus:outline-none focus:border-[var(--accent-acid)]">
              {Object.entries(POST_STATUSES).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
            </select>
          </div>
          <Input label="Estimated Value" type="number" placeholder="~$50 (optional)" value={form.estimatedValue} onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })} />
        </div>

        <div className="card p-6 flex flex-col gap-5">
          <h2 className="font-semibold font-display tracking-widest uppercase text-[var(--text-primary)]">Keywords</h2>
          <TagInput label="Offering" value={offerKeywords} onChange={setOfferKeywords} variant="offer" />
          <TagInput label="Seeking" value={seekKeywords} onChange={setSeekKeywords} variant="seek" />
        </div>

        <div className="card p-6 flex flex-col gap-4">
          <h2 className="font-semibold font-display tracking-widest uppercase text-[var(--text-primary)]">Images</h2>
          {images.length < 5 && (
            <div className="flex gap-2">
              <input type="url" placeholder="https://..." value={imageInput} onChange={(e) => setImageInput(e.target.value)} className="flex-1 px-3 py-2 border border-[var(--border-raw)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--accent-acid)]" />
              <Button type="button" variant="secondary" size="sm" onClick={() => { if (imageInput.trim()) { setImages([...images, imageInput.trim()]); setImageInput(""); } }}>Add</Button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="h-16 w-16 object-cover border border-[var(--border-raw)]" />
                <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button type="button" variant="danger" loading={deleting} onClick={handleDelete}>
            Remove Post
          </Button>
          <div className="flex gap-3">
            <Link href={`/post/${postId}`}>
              <Button type="button" variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
