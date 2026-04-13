import type { Metadata } from "next";
import Link from "next/link";
import { Mic, Mail } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Speaking",
  description: "Jose Leos is available for conference talks, panels, and workshops on design, front-end engineering, and building great software.",
  openGraph: {
    images: [{ url: "/api/og?title=Speaking&type=page", width: 1200, height: 630 }],
  },
};

const TOPICS = [
  {
    title: "Design Systems",
    description: "Building scalable component libraries, design tokens, and the workflow between design and engineering.",
  },
  {
    title: "Front-end Architecture",
    description: "React, Next.js, performance, and making thoughtful decisions when building for the web.",
  },
  {
    title: "Headless CMS & Content Infrastructure",
    description: "Going headless with WordPress, WPGraphQL, and building flexible content models.",
  },
  {
    title: "Developer Experience",
    description: "Tooling, workflows, and the practices that make teams ship faster and more confidently.",
  },
];

export default function SpeakingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <FadeIn>
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Mic size={28} className="text-[--foreground-muted]" />
            <h1 className="text-4xl font-bold text-[--foreground]">Speaking</h1>
          </div>
          <p className="text-lg text-[--foreground-muted] leading-relaxed">
            I&apos;m available for conference talks, panels, and internal team workshops.
            I speak about design systems, front-end architecture, and the craft of
            building good software.
          </p>
        </header>
      </FadeIn>

      <FadeIn delay={0.08}>
        <section className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[--foreground-muted] mb-6">
            Topics I speak about
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {TOPICS.map((topic, i) => (
              <div
                key={i}
                className="rounded-xl border border-[--border] p-5 bg-[--background]"
              >
                <p className="font-semibold text-[--foreground] mb-1.5">{topic.title}</p>
                <p className="text-sm text-[--foreground-muted] leading-relaxed">
                  {topic.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.16}>
        <div className="rounded-xl border border-[--border] bg-[--background-secondary] p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[--primary]/10 flex items-center justify-center mx-auto mb-4">
            <Mail size={20} className="text-[--primary]" />
          </div>
          <p className="font-semibold text-[--foreground] mb-2 text-lg">
            Interested in having me speak?
          </p>
          <p className="text-sm text-[--foreground-muted] mb-6 max-w-sm mx-auto">
            Send me a note with details about your event — format, audience,
            and topic you have in mind.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[--primary] text-[--primary-foreground] text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Mail size={15} />
            Get in Touch
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
