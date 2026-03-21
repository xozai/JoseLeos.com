"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Recommendations", href: "/recommendations" },
  { label: "About", href: "/about" },
];

export default function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
            href="/contact"
            className="ml-2 text-sm font-medium px-4 py-1.5 rounded-lg bg-[--primary] text-[--primary-foreground] hover:opacity-90 transition-opacity"
          >
            Contact
          </Link>
          <ThemeToggle />
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
        </div>
      )}
    </header>
  );
}
