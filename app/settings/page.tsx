"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", bio: "", location: "", avatar: "" });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [passErrors, setPassErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/users/${session.user.id}`)
      .then(r => r.json())
      .then(({ user }) => {
        if (user) setForm({ name: user.name || "", bio: user.bio || "", location: user.location || "", avatar: user.avatar || "" });
      });
  }, [session?.user?.id]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${session!.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update");
      await update({ name: form.name, image: form.avatar });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!passwords.current) errs.current = "Required";
    if (passwords.new.length < 8) errs.new = "Min 8 characters";
    if (passwords.new !== passwords.confirm) errs.confirm = "Passwords don't match";
    if (Object.keys(errs).length) { setPassErrors(errs); return; }
    setPassErrors({});
    setSavingPass(true);
    try {
      const res = await fetch(`/api/users/${session!.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setPasswords({ current: "", new: "", confirm: "" });
      toast.success("Password changed!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSavingPass(false);
    }
  };

  if (status === "loading") return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display tracking-widest uppercase text-[var(--text-primary)] mb-1">Settings</h1>
        <p className="text-[var(--text-dim)] text-sm">Manage your profile and account settings.</p>
      </div>

      {/* Profile */}
      <form onSubmit={handleSaveProfile} className="flex flex-col gap-6 mb-8">
        <div className="card p-6 flex flex-col gap-5">
          <h2 className="font-semibold font-display tracking-widest uppercase text-[var(--text-primary)]">Profile</h2>

          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            <Avatar src={form.avatar || session?.user?.image} name={form.name || session?.user?.name || "You"} size="lg" />
            <div className="flex-1">
              <Input
                label="Avatar URL"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                hint="Paste a public image URL"
              />
            </div>
          </div>

          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Location"
            placeholder="City, State (optional)"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <Textarea
            label="Bio"
            placeholder="Tell the community a bit about yourself..."
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
          />

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>Save Profile</Button>
          </div>
        </div>
      </form>

      {/* Password */}
      <form onSubmit={handleChangePassword} className="flex flex-col gap-6">
        <div className="card p-6 flex flex-col gap-5">
          <h2 className="font-semibold font-display tracking-widest uppercase text-[var(--text-primary)]">Change Password</h2>
          <Input
            label="Current Password"
            type="password"
            value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            error={passErrors.current}
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Min. 8 characters"
            value={passwords.new}
            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
            error={passErrors.new}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            error={passErrors.confirm}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={savingPass}>Change Password</Button>
          </div>
        </div>
      </form>

      {/* Danger zone */}
      <div className="card p-6 mt-6 border-red-200 dark:border-red-900">
        <h2 className="font-semibold text-red-600 mb-2">Account</h2>
        <p className="text-sm text-[var(--text-dim)] mb-4">
          Your account email: <strong className="text-[var(--text-primary)]">{session?.user?.email}</strong>
        </p>
      </div>
    </div>
  );
}
