"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, FileText, Layers } from "lucide-react";
import Link from "next/link";

interface SearchResult {
  id: number;
  title: string;
  url: string;
  type: "post" | "page" | string;
  subtype: string;
}

const WP_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL ?? "";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQuery(""); setResults([]); }
  }, [open]);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `${WP_URL}/wp-json/wp/v2/search?search=${encodeURIComponent(q)}&per_page=8`
      );
      const data: SearchResult[] = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { doSearch(debouncedQuery); }, [debouncedQuery, doSearch]);

  function localPath(result: SearchResult) {
    if (result.subtype === "portfolio_project") return `/portfolio/${result.url.split("/").filter(Boolean).pop()}`;
    if (result.type === "post") return `/blog/${result.url.split("/").filter(Boolean).pop()}`;
    return result.url;
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-[--foreground-muted] hover:text-[--foreground] transition-colors"
        aria-label="Search"
      >
        <Search size={16} />
        <span className="hidden lg:inline text-xs border border-[--border] rounded px-1.5 py-0.5 bg-[--background-secondary]">
          ⌘K
        </span>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg bg-[--background] rounded-2xl border border-[--border] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[--border]">
              <Search size={16} className="text-[--foreground-muted] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts and projects…"
                className="flex-1 bg-transparent text-[--foreground] placeholder:text-[--foreground-muted] text-sm focus:outline-none"
              />
              {loading && (
                <span className="text-xs text-[--foreground-muted] animate-pulse">Searching…</span>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-[--foreground-muted] hover:text-[--foreground]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <ul className="max-h-72 overflow-y-auto divide-y divide-[--border]">
                {results.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={localPath(r)}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[--background-secondary] transition-colors"
                    >
                      {r.type === "post" ? (
                        <FileText size={14} className="text-[--foreground-muted] shrink-0" />
                      ) : (
                        <Layers size={14} className="text-[--foreground-muted] shrink-0" />
                      )}
                      <span className="text-sm text-[--foreground] flex-1 truncate"
                        dangerouslySetInnerHTML={{ __html: r.title }}
                      />
                      <span className="text-xs text-[--foreground-muted] capitalize shrink-0">
                        {r.subtype === "portfolio_project" ? "Project" : r.type}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {query.length >= 2 && !loading && results.length === 0 && (
              <p className="px-4 py-6 text-sm text-center text-[--foreground-muted]">
                No results for &ldquo;{query}&rdquo;
              </p>
            )}

            {query.length < 2 && (
              <p className="px-4 py-4 text-xs text-center text-[--foreground-muted]">
                Type at least 2 characters to search
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
