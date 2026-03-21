"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, LayoutDashboard, LogOut, LogIn, Calendar } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import SearchOverlay from "@/components/ui/SearchOverlay";

const NAV_LINKS = [
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Recommendations", href: "/recommendations" },
  { label: "About", href: "/about" },
];

interface NavClientProps {
  session: {
    user?: { name?: string | null; email?: string | null; isOwner?: boolean };
  } | null;
}

export default function NavClient({ session }: NavClientProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initial = session?.user?.name?.[0] ?? session?.user?.email?.[0] ?? "?";

  return (
    <header className="sticky top-0 z-50 bg-[--background]/80 backdrop-blur-md border-b border-[--border]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-[--foreground] hover:text-[--primary] transition-colors"
        >
          Jose Leos
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "text-[--primary]"
                  : "text-[--foreground-muted] hover:text-[--foreground]"
              )}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/booking"
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-[--border] text-[--foreground-muted] hover:text-[--foreground] hover:border-[--primary] transition-colors"
          >
            <Calendar size={13} />
            Book a Meeting
          </Link>
          <Link
            href="/contact"
            className="ml-2 text-sm font-medium px-4 py-1.5 rounded-lg bg-[--primary] text-[--primary-foreground] hover:opacity-90 transition-opacity"
          >
            Contact
          </Link>
          <SearchOverlay />
          <ThemeToggle />

          {/* Auth controls */}
          {session?.user ? (
            <div className="flex items-center gap-2 ml-1">
              {session.user.isOwner && (
                <Link
                  href="/dashboard"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[--background-secondary] text-[--foreground-muted] hover:text-[--foreground] transition-colors"
                  title="Dashboard"
                >
                  <LayoutDashboard size={16} />
                </Link>
              )}
              <div className="flex items-center gap-1.5">
                <Link
                  href="/account"
                  className="w-7 h-7 rounded-full bg-[--primary] text-[--primary-foreground] flex items-center justify-center text-xs font-bold uppercase hover:opacity-80 transition-opacity"
                  title={session.user.email ?? "My Account"}
                >
                  {initial}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[--background-secondary] text-[--foreground-muted] hover:text-[--foreground] transition-colors"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-medium text-[--foreground-muted] hover:text-[--foreground] transition-colors ml-1"
            >
              <LogIn size={15} />
              Sign in
            </Link>
          )}
        </nav>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[--background-secondary] text-[--foreground]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[--border] bg-[--background] px-4 pb-4 pt-2 space-y-1">
          {[...NAV_LINKS, { label: "Contact", href: "/contact" }].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-[--background-secondary] text-[--primary]"
                  : "text-[--foreground-muted] hover:bg-[--background-secondary] hover:text-[--foreground]"
              )}
            >
              {label}
            </Link>
          ))}

          {session?.user ? (
            <>
              {session.user.isOwner && (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[--foreground-muted] hover:bg-[--background-secondary] hover:text-[--foreground] transition-colors"
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-[--foreground-muted] hover:bg-[--background-secondary] hover:text-[--foreground] transition-colors"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[--foreground-muted] hover:bg-[--background-secondary] hover:text-[--foreground] transition-colors"
            >
              <LogIn size={15} />
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
