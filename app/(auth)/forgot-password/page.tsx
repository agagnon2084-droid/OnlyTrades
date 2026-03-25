"use client";
import { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, send a password reset email via NextAuth or custom email service
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="card p-8 text-center">
        <div className="text-5xl mb-4">📬</div>
        <h1 className="text-2xl font-bold font-display tracking-widest uppercase text-[var(--text-primary)] mb-2">Check your email</h1>
        <p className="text-sm text-[var(--text-dim)] mb-6">
          If an account exists for <strong>{email}</strong>, you&apos;ll receive a password reset link shortly.
        </p>
        <Link href="/login">
          <Button variant="outline" size="lg" className="w-full">Back to Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <h1 className="text-2xl font-bold font-display tracking-widest uppercase text-[var(--text-primary)] mb-1">Forgot password?</h1>
      <p className="text-sm text-[var(--text-dim)] mb-6">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" size="lg" className="w-full mt-1">
          Send Reset Link
        </Button>
      </form>
      <p className="text-center text-sm text-[var(--text-dim)] mt-6">
        Remember your password?{" "}
        <Link href="/login" className="text-[var(--accent-acid)] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
