"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, FileText, Layers, Star } from "lucide-react";
import Link from "next/link";

interface SearchResult {
  id: number;
  title: string;
  url: string;
  type: "post" | "page" | string;
  subtype: string;
}

interface GroupedResults {
  posts:    SearchResult[];
  projects: SearchResult[];
  reviews:  SearchResult[];
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

function localPath(result: SearchResult): string {
  const lastSegment = result.url.split("/").filter(Boolean).pop() ?? "";
  if (result.subtype === "portfolio_project")         return `/portfolio/${lastSegment}`;
  if (result.subtype === "portfolio_recommendation")  return `/recommendations/${lastSegment}`;
  if (result.type === "post")                         return `/blog/${lastSegment}`;
  return result.url;
}

function groupResults(results: SearchResult[]): GroupedResults {
  return {
    posts:    results.filter((r) => r.type === "post" && r.subtype === "post"),
    projects: results.filter((r) => r.subtype === "portfolio_project"),
    reviews:  results.filter((r) => r.subtype === "portfolio_recommendation"),
  };
}

export default function SearchOverlay() {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState("");
  const [groups, setGroups]   = useState<GroupedResults>({ posts: [], projects: [], reviews: [] });
  const [loading, setLoading] = useState(false);
  const inputRef              = useRef<HTMLInputElement>(null);
  const debouncedQuery        = useDebounce(query, 300);

  const totalResults = groups.posts.length + groups.projects.length + groups.reviews.length;

  // ⌘K / Ctrl+K shortcut
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
    else { setQuery(""); setGroups({ posts: [], projects: [], reviews: [] }); }
  }, [open]);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setGroups({ posts: [], projects: [], reviews: [] });
      return;
    }
    setLoading(true);
    try {
      const encoded = encodeURIComponent(q);
      // Fetch posts/projects + recommendations in parallel
      const [generalRes, recsRes] = await Promise.all([
        fetch(`${WP_URL}/wp-json/wp/v2/search?search=${encoded}&per_page=6`),
        fetch(`${WP_URL}/wp-json/wp/v2/search?search=${encoded}&per_page=4&type=post&subtype=portfolio_recommendation`),
      ]);

      const general: SearchResult[] = generalRes.ok ? await generalRes.json() : [];
      const recs:    SearchResult[] = recsRes.ok    ? await recsRes.json()    : [];

      // Merge, deduplicate by id
      const seen  = new Set<number>();
      const merged: SearchResult[] = [];
      for (const r of [...general, ...recs]) {
        if (!seen.has(r.id)) { seen.add(r.id); merged.push(r); }
      }

      setGroups(groupResults(merged));
    } catch {
      setGroups({ posts: [], projects: [], reviews: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { doSearch(debouncedQuery); }, [debouncedQuery, doSearch]);

  return (
    <>
      {/* Trigger */}
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
            {/* Input row */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[--border]">
              <Search size={16} className="text-[--foreground-muted] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts, projects and reviews…"
                className="flex-1 bg-transparent text-[--foreground] placeholder:text-[--foreground-muted] text-sm focus:outline-none"
              />
              {loading && (
                <span className="text-xs text-[--foreground-muted] animate-pulse">Searching…</span>
              )}
              <button onClick={() => setOpen(false)} className="text-[--foreground-muted] hover:text-[--foreground]">
                <X size={16} />
              </button>
            </div>

            {/* Grouped results */}
            {totalResults > 0 && (
              <div className="max-h-80 overflow-y-auto">
                {(["posts", "projects", "reviews"] as const).map((group) => {
                  const items = groups[group];
                  if (items.length === 0) return null;

                  const label = group === "posts" ? "Posts" : group === "projects" ? "Projects" : "Reviews";

                  return (
                    <div key={group}>
                      <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[--foreground-muted]">
                        {label}
                      </p>
                      <ul className="divide-y divide-[--border]">
                        {items.map((r) => (
                          <li key={r.id}>
                            <Link
                              href={localPath(r)}
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-[--background-secondary] transition-colors"
                            >
                              {group === "posts" && (
                                <FileText size={14} className="text-[--foreground-muted] shrink-0" />
                              )}
                              {group === "projects" && (
                                <Layers size={14} className="text-[--foreground-muted] shrink-0" />
                              )}
                              {group === "reviews" && (
                                <Star size={14} className="text-[--primary] shrink-0" />
                              )}
                              <span
                                className="text-sm text-[--foreground] flex-1 truncate"
                                dangerouslySetInnerHTML={{ __html: r.title }}
                              />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}

            {query.length >= 2 && !loading && totalResults === 0 && (
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
