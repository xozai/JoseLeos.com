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

const NOW_ITEMS = [
  {
    heading: "Building in public",
    body: "Shipping this portfolio site and writing about the decisions behind it. There's a lot to share about the stack choices, the design process, and the trade-offs I made.",
  },
  {
    heading: "Learning Rust",
    body: "Working through the official Rust book and building small CLI tools. It's the most challenging language I've picked up in years, and the ownership model is finally starting to click.",
  },
  {
    heading: "Design systems deep-dive",
    body: "Rebuilding a component library from scratch at work using Radix UI primitives + Tailwind. Writing up what I'm learning along the way.",
  },
  {
    heading: "Reading",
    body: "Currently: The Pragmatic Programmer (re-read), Four Thousand Weeks by Oliver Burkeman, and Deep Work by Cal Newport. Also working through the Figma blog archive.",
  },
  {
    heading: "Somewhere in the world",
    body: "Based in [City], working remotely. If you're nearby and want to grab coffee, reach out.",
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
