"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export default function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "already" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.alreadySubscribed) setState("already");
      else if (data.success) setState("success");
      else setState("error");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="mt-12 rounded-xl border border-[--border] bg-[--background-secondary] p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[--primary]/10 flex items-center justify-center shrink-0">
          <Mail size={18} className="text-[--primary]" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-[--foreground] mb-1">Stay in the loop</h3>
          <p className="text-sm text-[--foreground-muted] mb-4">
            Get new articles delivered straight to your inbox. No spam, unsubscribe anytime.
          </p>

          {state === "success" && (
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              You&apos;re subscribed! 🎉
            </p>
          )}
          {state === "already" && (
            <p className="text-sm font-medium text-[--foreground-muted]">
              You&apos;re already subscribed.
            </p>
          )}
          {state === "error" && (
            <p className="text-sm font-medium text-red-500">
              Something went wrong — please try again.
            </p>
          )}

          {(state === "idle" || state === "loading") && (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 rounded-lg border border-[--border] bg-[--background] px-3 py-2 text-sm text-[--foreground] placeholder:text-[--foreground-muted] focus:outline-none focus:ring-2 focus:ring-[--primary] focus:border-transparent"
              />
              <button
                type="submit"
                disabled={state === "loading"}
                className="px-4 py-2 rounded-lg bg-[--primary] text-[--primary-foreground] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {state === "loading" ? "…" : "Subscribe"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
