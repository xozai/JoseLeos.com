import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LogOut, Bookmark, BookOpen } from "lucide-react";
import { auth } from "@/auth";
import { kv } from "@vercel/kv";

export const metadata: Metadata = { title: "My Account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) notFound();

  const { name, email } = session.user;
  const initial = (name?.[0] ?? email?.[0] ?? "?").toUpperCase();

  // Fetch saved items count
  let savedCount = 0;
  try {
    savedCount = (await kv.smembers(`saves:${email}`))?.length ?? 0;
  } catch {
    /* KV not configured yet — degrade gracefully */
  }

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
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl border border-[--border] bg-[--background-secondary] p-4 flex items-center gap-3">
          <Bookmark size={18} className="text-[--primary] shrink-0" />
          <div>
            <p className="text-xl font-bold text-[--foreground]">{savedCount}</p>
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
