"use client";

import { useState, useEffect } from "react";
import { Eye } from "lucide-react";

const EMOJIS = ["👍", "❤️", "🔥"] as const;

interface PostEngagementProps {
  slug: string;
  authenticated: boolean;
}

export default function PostEngagement({ slug, authenticated }: PostEngagementProps) {
  const [views, setViews] = useState<number | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    // Increment view count
    fetch(`/api/views/${encodeURIComponent(slug)}`, { method: "POST" })
      .then((r) => r.json())
      .then((d) => setViews(d.views))
      .catch(() => {});

    // Fetch reaction counts
    fetch(`/api/react/${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => {
        setCounts(d.counts ?? {});
        setUserReactions(d.userReactions ?? {});
      })
      .catch(() => {});
  }, [slug]);

  async function react(emoji: string) {
    if (!authenticated || loading) return;
    setLoading(emoji);
    try {
      const res = await fetch(`/api/react/${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      const data = await res.json();
      setCounts((prev) => ({ ...prev, [emoji]: data.count }));
      setUserReactions((prev) => ({ ...prev, [emoji]: data.reacted }));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-10 pt-8 border-t border-[--border] flex flex-wrap items-center justify-between gap-4">
      {/* Reactions */}
      <div className="flex items-center gap-2">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => react(emoji)}
            disabled={!authenticated || loading === emoji}
            title={authenticated ? "React" : "Sign in to react"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
              userReactions[emoji]
                ? "border-[--primary] bg-[--primary]/10 text-[--foreground]"
                : "border-[--border] text-[--foreground-muted] hover:border-[--foreground-muted]"
            } ${!authenticated ? "cursor-default opacity-70" : "cursor-pointer"}`}
          >
            <span>{emoji}</span>
            {counts[emoji] ? (
              <span className="text-xs font-medium">{counts[emoji]}</span>
            ) : null}
          </button>
        ))}
        {!authenticated && (
          <span className="text-xs text-[--foreground-muted] ml-1">
            <a href="/login" className="underline hover:text-[--foreground]">Sign in</a> to react
          </span>
        )}
      </div>

      {/* View count */}
      {views !== null && (
        <div className="flex items-center gap-1.5 text-sm text-[--foreground-muted]">
          <Eye size={14} />
          {views.toLocaleString()} {views === 1 ? "view" : "views"}
        </div>
      )}
    </div>
  );
}
