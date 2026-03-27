import Link from "next/link";
import { Github, Twitter, Linkedin, Rss } from "lucide-react";

const SOCIAL = [
  { icon: Github, href: "https://github.com/joseleos", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com/joseleos", label: "Twitter / X" },
  { icon: Linkedin, href: "https://linkedin.com/in/joseleos", label: "LinkedIn" },
  { icon: Rss, href: "/feed.xml", label: "RSS Feed" },
];

const FOOTER_LINKS = [
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Recommendations", href: "/recommendations" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Book a Meeting", href: "/booking" },
  { label: "Uses", href: "/uses" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[--border] mt-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="text-lg font-bold text-[--foreground]">
              Jose Leos
            </Link>
            <p className="text-sm text-[--foreground-muted] max-w-xs">
              Designer, developer, and writer sharing work, ideas, and recommendations.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a
                  key={href}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  className="text-[--foreground-muted] hover:text-[--foreground] transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <nav className="grid grid-cols-2 gap-x-12 gap-y-2">
            {FOOTER_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-[--foreground-muted] hover:text-[--foreground] transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 pt-6 border-t border-[--border] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[--foreground-muted]">
          <p>&copy; {new Date().getFullYear()} Jose Leos. All rights reserved.</p>
          <p>Built with Next.js &amp; WordPress</p>
        </div>
      </div>
    </footer>
  );
}
