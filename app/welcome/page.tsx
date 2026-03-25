"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import TagInput from "@/components/TagInput";
import Select from "@/components/ui/Select";
import PostCard from "@/components/PostCard";
import { CATEGORIES, POST_TYPES } from "@/lib/constants";
import toast from "react-hot-toast";

type Step = 1 | 2 | 3;

interface MatchedPost {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  status: string;
  offerKeywords: string[];
  seekKeywords: string[];
  images: string[];
  createdAt: string;
  user: { id: string; name: string | null; avatar: string | null };
}

export default function WelcomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Identity
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameAvail, setUsernameAvail] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [tagline, setTagline] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  // Step 2: First post
  const [postTitle, setPostTitle] = useState("");
  const [postDesc, setPostDesc] = useState("");
  const [postCategory, setPostCategory] = useState("");
  const [postOfferKw, setPostOfferKw] = useState<string[]>([]);
  const [postSeekKw, setPostSeekKw] = useState<string[]>([]);

  // Step 3: Matches
  const [matchedPosts, setMatchedPosts] = useState<MatchedPost[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Debounced username check
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvail(null);
      return;
    }
    setUsernameChecking(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(username)}`);
        const data = await res.json();
        setUsernameAvail(data.available);
      } catch {
        setUsernameAvail(null);
      } finally {
        setUsernameChecking(false);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [username]);

  // Fetch matches for step 3
  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch("/api/discover?limit=6");
      const data = await res.json();
      setMatchedPosts((data.posts || []).slice(0, 6));
    } catch {
      // fallback: empty
    }
  }, []);

  const handleStep1Submit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName || undefined,
          username: username || undefined,
          tagline: tagline || undefined,
          location: location || undefined,
          skills,
          interests,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save profile");
      }
      setStep(2);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleStep2Submit = async () => {
    if (!postTitle || !postCategory) {
      toast.error("Title and category are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postTitle,
          description: postDesc,
          category: postCategory,
          type: "ITEM",
          offerKeywords: postOfferKw,
          seekKeywords: postSeekKw,
        }),
      });
      if (!res.ok) throw new Error("Failed to create post");
      toast.success("Post created!");
      await fetchMatches();
      setStep(3);
    } catch {
      toast.error("Failed to create post");
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    try {
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasCompletedOnboarding: true }),
      });
    } catch {
      // non-critical
    }
    router.push("/discover");
  };

  const handleSkipToEnd = async () => {
    try {
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasCompletedOnboarding: true }),
      });
    } catch {
      // non-critical
    }
    router.push("/dashboard");
  };

  if (status === "loading") return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-4 mb-12 font-mono text-xs tracking-widest">
        {[1, 2, 3].map((s, i) => (
          <div key={s} className="flex items-center gap-4">
            <span className={`px-3 py-1 border ${step === s ? "border-[var(--accent-acid)] text-[var(--accent-acid)]" : step > s ? "border-[var(--accent-static)] text-[var(--accent-static)]" : "border-[var(--border-raw)] text-[var(--text-ghost)]"}`}>
              {String(s).padStart(2, "0")}
            </span>
            {i < 2 && <span className="w-12 h-px bg-[var(--border-raw)]" />}
          </div>
        ))}
      </div>

      {/* Step 1: Identity */}
      {step === 1 && (
        <div>
          <div className="mb-8">
            <div className="text-[10px] font-mono tracking-widest text-[var(--accent-static)] mb-2">// STEP 01</div>
            <h1 className="text-2xl font-display tracking-widest text-[var(--text-primary)] mb-2">BUILD YOUR IDENTITY</h1>
            <p className="text-xs font-mono text-[var(--text-dim)]">Tell the collective who you are and what you bring to the table.</p>
          </div>

          <div className="flex flex-col gap-5">
            <Input
              label="DISPLAY NAME"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={session?.user?.name || "Your name"}
            />

            <div>
              <Input
                label="USERNAME"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                placeholder="your_handle"
                hint={
                  usernameChecking ? "Checking..." :
                  usernameAvail === true ? "Available ✓" :
                  usernameAvail === false ? "Already taken" :
                  username.length > 0 && username.length < 3 ? "Min 3 characters" :
                  undefined
                }
                error={usernameAvail === false ? "Username is taken" : undefined}
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-[0.1em] text-[var(--text-dim)] uppercase mb-1">TAGLINE</label>
              <div className="relative">
                <input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value.slice(0, 80))}
                  placeholder="Your one-liner..."
                  className="w-full px-4 py-3 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm font-mono border-0 border-b border-b-[var(--border-raw)] border-l-2 border-l-[var(--accent-acid)] placeholder:text-[var(--text-ghost)] focus:outline-none focus:border-b-[var(--accent-acid)] transition-all duration-[80ms]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--text-ghost)]">{tagline.length}/80</span>
              </div>
            </div>

            <Input
              label="LOCATION (OPTIONAL)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
            />

            <TagInput
              label="SKILLS — what are you good at?"
              value={skills}
              onChange={setSkills}
              variant="offer"
              max={10}
            />

            <TagInput
              label="INTERESTS — what do you want to trade for?"
              value={interests}
              onChange={setInterests}
              variant="seek"
              max={10}
            />
          </div>

          <div className="flex items-center justify-between mt-8">
            <button onClick={() => { setStep(2); }} className="text-xs font-mono tracking-widest text-[var(--text-dim)] hover:text-[var(--accent-acid)] transition-colors">
              DO THIS LATER →
            </button>
            <Button onClick={handleStep1Submit} loading={saving}>
              IDENTIFY YOURSELF →
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: First Post */}
      {step === 2 && (
        <div>
          <div className="mb-8">
            <div className="text-[10px] font-mono tracking-widest text-[var(--accent-static)] mb-2">// STEP 02</div>
            <h1 className="text-2xl font-display tracking-widest text-[var(--text-primary)] mb-2">WHAT DO YOU HAVE TO OFFER THE COLLECTIVE?</h1>
            <p className="text-xs font-mono text-[var(--text-dim)]">Post your first trade. It can be anything — a skill, an item, an experience.</p>
          </div>

          <div className="flex flex-col gap-5">
            <Input
              label="TITLE"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="What are you offering?"
            />

            <Textarea
              label="DESCRIPTION"
              value={postDesc}
              onChange={(e) => setPostDesc(e.target.value)}
              placeholder="Describe what you're offering in detail..."
              rows={4}
            />

            <Select
              label="CATEGORY"
              value={postCategory}
              onChange={(e) => setPostCategory(e.target.value)}
              options={CATEGORIES.map(c => ({ value: c.value, label: `${c.icon} ${c.label}` }))}
              placeholder="Select a category"
            />

            <TagInput
              label="OFFER KEYWORDS"
              value={postOfferKw}
              onChange={setPostOfferKw}
              variant="offer"
              max={10}
            />

            <TagInput
              label="SEEK KEYWORDS (optional)"
              value={postSeekKw}
              onChange={setPostSeekKw}
              variant="seek"
              max={10}
              hint="What would you want in return?"
            />
          </div>

          <div className="flex items-center justify-between mt-8">
            <button onClick={async () => { await fetchMatches(); setStep(3); }} className="text-xs font-mono tracking-widest text-[var(--text-dim)] hover:text-[var(--accent-acid)] transition-colors">
              SKIP FOR NOW →
            </button>
            <Button onClick={handleStep2Submit} loading={saving}>
              PUT IT OUT THERE →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Find Your People */}
      {step === 3 && (
        <div>
          <div className="mb-8">
            <div className="text-[10px] font-mono tracking-widest text-[var(--accent-static)] mb-2">// STEP 03</div>
            <h1 className="text-2xl font-display tracking-widest text-[var(--text-primary)] mb-2">YOUR FIRST MATCHES</h1>
            <p className="text-xs font-mono text-[var(--text-dim)]">
              These traders are offering what you might be looking for. Message them. Start trading.
            </p>
          </div>

          {matchedPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[var(--border-raw)] mb-8">
              {matchedPosts.map((post) => (
                <div key={post.id} className="bg-[var(--bg-void)]">
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs font-mono text-[var(--text-ghost)] mb-8">
              // NO MATCHES YET — EXPLORE THE MARKET TO FIND WHAT YOU NEED
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={handleComplete}>
              EXPLORE THE MARKET →
            </Button>
            <button onClick={handleSkipToEnd} className="text-xs font-mono tracking-widest text-[var(--text-dim)] hover:text-[var(--accent-acid)] transition-colors">
              GO TO DASHBOARD →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
