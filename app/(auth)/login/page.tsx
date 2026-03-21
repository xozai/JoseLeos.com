"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result = await signIn("resend", {
      email,
      redirect: false,
      callbackUrl: "/",
    });

    if (result?.error) {
      setError("Something went wrong. Please try again.");
      setPending(false);
    } else {
      window.location.href = "/login/verify";
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-[--border] bg-[--background-secondary] p-8 shadow-sm">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-xl font-bold text-[--foreground] hover:text-[--primary] transition-colors"
          >
            Jose Leos
          </Link>
          <p className="mt-2 text-sm text-[--foreground-muted]">
            Sign in to access member content
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[--foreground] mb-1.5"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-[--border] bg-[--background] px-3 py-2 text-sm text-[--foreground] placeholder:text-[--foreground-muted] focus:outline-none focus:ring-2 focus:ring-[--primary] focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-[--primary] px-4 py-2 text-sm font-medium text-[--primary-foreground] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? "Sending link…" : "Send magic link"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-[--foreground-muted]">
          We&apos;ll email you a secure sign-in link. No password required.
        </p>
      </div>
    </div>
  );
}
