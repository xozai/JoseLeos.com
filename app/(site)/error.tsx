"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function SiteError({
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
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={24} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-[--foreground] mb-2">Something went wrong</h1>
        <p className="text-[--foreground-muted] text-sm mb-6">
          An unexpected error occurred while loading this page.
          {error.digest && (
            <span className="block mt-1 text-xs font-mono opacity-60">
              Error ID: {error.digest}
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
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
    </div>
  );
}
