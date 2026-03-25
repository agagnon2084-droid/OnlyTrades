"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email.includes("@")) errs.email = "Enter a valid email";
    if (password.length < 8) errs.password = "Password must be at least 8 characters";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setErrors({ general: data.error || "Registration failed" });
      return;
    }

    // Auto sign in
    await signIn("credentials", { email, password, redirect: false });
    toast.success("Welcome to OnlyTrades!");
    router.push("/dashboard");
    router.refresh();
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="card p-8">
      <h1 className="text-2xl font-bold font-display tracking-widest uppercase text-[var(--text-primary)] mb-1">Create your account</h1>
      <p className="text-sm text-[var(--text-dim)] mb-6">Join the cashless trade economy</p>

      {errors.general && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-700">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint="At least 8 characters"
          required
        />
        <Button type="submit" size="lg" loading={loading} className="w-full mt-1">
          Create Account
        </Button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-[var(--border-raw)]" />
        <span className="text-xs text-[var(--text-dim)]">or</span>
        <div className="flex-1 h-px bg-[var(--border-raw)]" />
      </div>

      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={handleGoogle}
        loading={googleLoading}
        type="button"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </Button>

      <p className="text-center text-sm text-[var(--text-dim)] mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--accent-acid)] font-medium hover:underline">
          Sign in
        </Link>
      </p>

      <p className="text-center text-xs text-[var(--text-dim)] mt-4">
        By signing up, you agree to our{" "}
        <span className="text-[var(--accent-acid)] cursor-pointer hover:underline">Terms of Service</span>
        {" "}and{" "}
        <span className="text-[var(--accent-acid)] cursor-pointer hover:underline">Privacy Policy</span>.
      </p>
    </div>
  );
}
