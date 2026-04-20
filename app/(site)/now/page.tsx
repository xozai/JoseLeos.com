import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Now",
  description: "What Jose Leos is focused on right now.",
  openGraph: {
    images: [{ url: "/api/og?title=Now&type=page", width: 1200, height: 630 }],
  },
};

// Last updated date — bump this whenever the page content changes
const LAST_UPDATED = "March 2026";

// TODO: Replace with what you're actually focused on right now
const NOW_ITEMS = [
  {
    heading: "TODO: Current project",
    body: "TODO: Describe what you're building or working on.",
  },
  {
    heading: "TODO: Learning",
    body: "TODO: What are you studying or exploring?",
  },
  {
    heading: "TODO: Reading",
    body: "TODO: What books or articles are you reading?",
  },
  {
    heading: "TODO: Location",
    body: "TODO: Where are you based? Open to meeting up?",
  },
];

export default function NowPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <FadeIn>
        <header className="mb-12">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h1 className="text-4xl font-bold text-[--foreground]">Now</h1>
            <span className="text-xs text-[--foreground-muted] border border-[--border] px-2.5 py-1 rounded-full">
              Updated {LAST_UPDATED}
            </span>
          </div>
          <p className="text-lg text-[--foreground-muted] leading-relaxed">
            A snapshot of what I&apos;m working on, reading, and thinking about right now.
            Inspired by{" "}
            <a
              href="https://nownownow.com/about"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[--primary] hover:underline"
            >
              Derek Sivers&apos; /now page idea
            </a>.
          </p>
        </header>
      </FadeIn>

      <div className="space-y-8">
        {NOW_ITEMS.map(({ heading, body }, i) => (
          <FadeIn key={heading} index={i}>
            <div className="border-l-2 border-[--primary] pl-5">
              <h2 className="font-semibold text-[--foreground] mb-1.5">{heading}</h2>
              <p className="text-[--foreground-muted] leading-relaxed text-sm sm:text-base">{body}</p>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.3}>
        <div className="mt-14 pt-8 border-t border-[--border] flex flex-wrap gap-4 text-sm text-[--foreground-muted]">
          <span>
            Want to know more?{" "}
            <Link href="/about" className="text-[--primary] hover:underline">Read my about page</Link>
            {" "}or{" "}
            <Link href="/contact" className="text-[--primary] hover:underline">get in touch</Link>.
          </span>
        </div>
      </FadeIn>
    </div>
  );
}
