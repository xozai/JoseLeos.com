"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";

interface BookmarkButtonProps {
  type: "post" | "project";
  slug: string;
  /** Pass true when the user is signed in (determined server-side) */
  authenticated: boolean;
}

export default function BookmarkButton({ type, slug, authenticated }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authenticated) return;
    fetch(`/api/save?type=${type}&slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => setSaved(!!d.saved))
      .catch(() => {});
  }, [authenticated, type, slug]);

  if (!authenticated) return null;

  async function toggle() {
    setLoading(true);
    try {
      const method = saved ? "DELETE" : "POST";
      const res = await fetch("/api/save", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, slug }),
      });
      const data = await res.json();
      setSaved(data.saved);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? "Remove bookmark" : "Save for later"}
      aria-label={saved ? "Remove bookmark" : "Save for later"}
      className={`p-1.5 rounded-lg transition-colors ${
        saved
          ? "text-[--primary] bg-[--primary]/10"
          : "text-[--foreground-muted] hover:text-[--foreground] hover:bg-[--background-secondary]"
      }`}
    >
      <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
