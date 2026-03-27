import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LogOut, Bookmark, BookOpen, FileText, Briefcase, Star, ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { kv } from "@vercel/kv";

export const metadata: Metadata = { title: "My Account" };
export const dynamic = "force-dynamic";

const TYPE_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
  href: (slug: string) => string;
}> = {
  post:           { label: "Posts",          icon: FileText,  href: (s) => `/blog/${s}` },
  project:        { label: "Projects",       icon: Briefcase, href: (s) => `/portfolio/${s}` },
  recommendation: { label: "Recommendations", icon: Star,      href: (s) => `/recommendations/${s}` },
};

interface SavedItem {
  type: string;
  slug: string;
}

function parseSavedItems(raw: string[]): SavedItem[] {
  return raw
    .map((item) => {
      const colonIdx = item.indexOf(":");
      if (colonIdx === -1) return null;
      return { type: item.slice(0, colonIdx), slug: item.slice(colonIdx + 1) };
    })
    .filter(Boolean) as SavedItem[];
}

function groupByType(items: SavedItem[]): Record<string, SavedItem[]> {
  return items.reduce<Record<string, SavedItem[]>>((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});
}

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) notFound();

  const { name, email } = session.user;
  const initial = (name?.[0] ?? email?.[0] ?? "?").toUpperCase();

  // Fetch all saved items
  let savedItems: SavedItem[] = [];
  try {
    const raw = (await kv.smembers(`saves:${email}`)) as string[];
    savedItems = parseSavedItems(raw ?? []);
  } catch {
    /* KV not configured yet — degrade gracefully */
  }

  const grouped = groupByType(savedItems);
  const totalSaved = savedItems.length;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-[--foreground] mb-10">My Account</h1>

      {/* Profile card */}
      <div className="rounded-xl border border-[--border] bg-[--background-secondary] p-6 mb-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-[--primary] text-[--primary-foreground] flex items-center justify-center text-2xl font-bold shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          {name && <p className="font-semibold text-[--foreground] truncate">{name}</p>}
          <p className="text-sm text-[--foreground-muted] truncate">{email}</p>
          {session.user.isOwner && (
            <span className="inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full bg-[--primary]/10 text-[--primary]">
              Site Owner
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="rounded-xl border border-[--border] bg-[--background-secondary] p-4 flex items-center gap-3">
          <Bookmark size={18} className="text-[--primary] shrink-0" />
          <div>
            <p className="text-xl font-bold text-[--foreground]">{totalSaved}</p>
            <p className="text-xs text-[--foreground-muted]">Saved items</p>
          </div>
        </div>
        <Link
          href="/blog"
          className="rounded-xl border border-[--border] bg-[--background-secondary] p-4 flex items-center gap-3 hover:border-[--primary] transition-colors"
        >
          <BookOpen size={18} className="text-[--primary] shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[--foreground]">Member Content</p>
            <p className="text-xs text-[--foreground-muted]">Browse exclusive posts</p>
          </div>
        </Link>
      </div>

      {/* Saved items grouped by type */}
      {totalSaved > 0 ? (
        <div className="mb-8 space-y-6">
          <h2 className="text-lg font-semibold text-[--foreground]">Saved Items</h2>
          {Object.entries(grouped).map(([type, items]) => {
            const config = TYPE_CONFIG[type];
            if (!config) return null;
            const Icon = config.icon;
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={14} className="text-[--foreground-muted]" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[--foreground-muted]">
                    {config.label}
                  </h3>
                </div>
                <div className="rounded-xl border border-[--border] divide-y divide-[--border] overflow-hidden">
                  {items.map(({ slug }) => (
                    <Link
                      key={slug}
                      href={config.href(slug)}
                      className="flex items-center justify-between px-4 py-3 bg-[--background-secondary] hover:bg-[--background] transition-colors group"
                    >
                      <span className="text-sm text-[--foreground] group-hover:text-[--primary] transition-colors truncate">
                        {slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                      <ArrowRight size={13} className="text-[--foreground-muted] shrink-0 ml-2" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mb-8 rounded-xl border border-dashed border-[--border] p-8 text-center">
          <Bookmark size={24} className="mx-auto text-[--foreground-muted] mb-3 opacity-40" />
          <p className="text-sm text-[--foreground-muted] mb-1">No saved items yet.</p>
          <p className="text-xs text-[--foreground-muted]">
            Use the bookmark icon on any post, project, or review to save it here.
          </p>
        </div>
      )}

      {/* Owner shortcut */}
      {session.user.isOwner && (
        <Link
          href="/dashboard"
          className="flex items-center justify-between w-full rounded-xl border border-[--border] bg-[--background-secondary] px-5 py-4 mb-6 hover:border-[--primary] transition-colors"
        >
          <span className="text-sm font-medium text-[--foreground]">Owner Dashboard</span>
          <span className="text-xs text-[--foreground-muted]">→</span>
        </Link>
      )}

      {/* Sign out */}
      <form action="/api/auth/signout" method="POST">
        <button
          type="submit"
          className="flex items-center gap-2 text-sm text-[--foreground-muted] hover:text-red-500 transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </form>
    </div>
  );
}
