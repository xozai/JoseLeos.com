"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Star } from "lucide-react";

export default function RecommendationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <div className="w-12 h-12 rounded-full bg-[--background-secondary] flex items-center justify-center mx-auto mb-4">
        <Star size={20} className="text-[--foreground-muted]" />
      </div>
      <h1 className="text-xl font-bold text-[--foreground] mb-2">Failed to load recommendations</h1>
      <p className="text-[--foreground-muted] text-sm mb-6">
        There was a problem fetching content from the CMS. Please try again.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-lg bg-[--primary] text-[--primary-foreground] text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-lg border border-[--border] text-[--foreground] text-sm font-medium hover:bg-[--background-secondary] transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
