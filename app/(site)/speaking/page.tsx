import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Video, Presentation } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import { apolloClient } from "@/lib/graphql/client";
import { GET_SPEAKING_EVENTS } from "@/lib/graphql/queries/speaking";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Speaking",
  description: "Talks, panels, and conference appearances by Jose Leos.",
  openGraph: {
    images: [{ url: "/api/og?title=Speaking&type=page", width: 1200, height: 630 }],
  },
};

interface SpeakingEvent {
  slug: string;
  title: string;
  speakingFields: {
    eventName: string;
    eventDate: string;
    eventUrl: string | null;
    location: string;
    talkTitle: string;
    slidesUrl: string | null;
    videoUrl: string | null;
    description: string | null;
  };
}

// Fallback demo talks shown when WP CPT is not yet set up
const DEMO_TALKS: SpeakingEvent[] = [
  {
    slug: "demo-1",
    title: "Demo Talk",
    speakingFields: {
      eventName: "React Summit",
      eventDate: "2024-11-14",
      eventUrl: null,
      location: "Amsterdam, NL",
      talkTitle: "Design Systems at Scale: From Figma to Production",
      slidesUrl: null,
      videoUrl: null,
      description: "How we built a cross-platform design system that ships Figma tokens directly to code.",
    },
  },
  {
    slug: "demo-2",
    title: "Demo Talk 2",
    speakingFields: {
      eventName: "Next.js Conf",
      eventDate: "2024-10-24",
      eventUrl: null,
      location: "San Francisco, CA",
      talkTitle: "Edge-first Architecture for Content-heavy Sites",
      slidesUrl: null,
      videoUrl: null,
      description: "Lessons from migrating a high-traffic site to the Vercel Edge Network.",
    },
  },
  {
    slug: "demo-3",
    title: "Demo Talk 3",
    speakingFields: {
      eventName: "CSS Day",
      eventDate: "2024-06-07",
      eventUrl: null,
      location: "Amsterdam, NL",
      talkTitle: "The Quiet Revolution of CSS Layers",
      slidesUrl: null,
      videoUrl: null,
      description: "A practical guide to @layer, cascade control, and why it changes how we write CSS.",
    },
  },
];

function formatEventDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function groupByYear(events: SpeakingEvent[]) {
  const map = new Map<string, SpeakingEvent[]>();
  for (const ev of events) {
    const year = new Date(ev.speakingFields.eventDate).getFullYear().toString();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(ev);
  }
  // Sort descending
  return [...map.entries()].sort(([a], [b]) => Number(b) - Number(a));
}

export default async function SpeakingPage() {
  let events: SpeakingEvent[] = [];
  let usingDemo = false;

  try {
    const res = await apolloClient.query({ query: GET_SPEAKING_EVENTS });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    const nodes: SpeakingEvent[] = data?.speakingEvents?.nodes ?? [];
    events = nodes.sort(
      (a, b) =>
        new Date(b.speakingFields.eventDate).getTime() -
        new Date(a.speakingFields.eventDate).getTime()
    );
  } catch {
    /* CPT not yet configured in WP — fall back to demo data */
  }

  if (events.length === 0) {
    events = DEMO_TALKS;
    usingDemo = true;
  }

  const grouped = groupByYear(events);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <FadeIn>
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-[--foreground] mb-4">Speaking</h1>
          <p className="text-lg text-[--foreground-muted] leading-relaxed">
            Talks, panels, and workshops I&apos;ve given at conferences and community events.
            I speak about design systems, front-end architecture, and the craft of building
            good software.
          </p>
          {usingDemo && (
            <p className="mt-3 text-xs text-[--foreground-muted] border border-dashed border-[--border] rounded-lg px-3 py-2">
              Demo data — add real events via the WordPress <code>speakingEvents</code> CPT.
            </p>
          )}
        </header>
      </FadeIn>

      <div className="space-y-12">
        {grouped.map(([year, yearEvents], gi) => (
          <FadeIn key={year} index={gi}>
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[--foreground-muted] mb-6 pb-2 border-b border-[--border]">
                {year}
              </h2>
              <div className="space-y-6">
                {yearEvents.map((ev) => {
                  const { speakingFields: sf } = ev;
                  return (
                    <div
                      key={ev.slug}
                      className="group rounded-xl border border-[--border] p-5 hover:border-[--primary] transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div>
                          <p className="font-semibold text-[--foreground] leading-snug">
                            {sf.talkTitle}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {sf.eventUrl ? (
                              <a
                                href={sf.eventUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[--primary] hover:underline inline-flex items-center gap-1"
                              >
                                {sf.eventName}
                                <ExternalLink size={11} />
                              </a>
                            ) : (
                              <span className="text-sm text-[--primary]">{sf.eventName}</span>
                            )}
                            <span className="text-sm text-[--foreground-muted]">·</span>
                            <span className="text-sm text-[--foreground-muted]">{sf.location}</span>
                          </div>
                        </div>
                        <span className="text-xs text-[--foreground-muted] shrink-0">
                          {formatEventDate(sf.eventDate)}
                        </span>
                      </div>

                      {sf.description && (
                        <p className="text-sm text-[--foreground-muted] leading-relaxed mb-3">
                          {sf.description}
                        </p>
                      )}

                      {(sf.slidesUrl || sf.videoUrl) && (
                        <div className="flex gap-3">
                          {sf.slidesUrl && (
                            <a
                              href={sf.slidesUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-[--foreground-muted] hover:text-[--primary] transition-colors"
                            >
                              <Presentation size={12} />
                              Slides
                            </a>
                          )}
                          {sf.videoUrl && (
                            <a
                              href={sf.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-[--foreground-muted] hover:text-[--primary] transition-colors"
                            >
                              <Video size={12} />
                              Watch
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.3}>
        <div className="mt-14 rounded-xl border border-[--border] bg-[--background-secondary] p-6 text-center">
          <p className="font-semibold text-[--foreground] mb-2">Interested in having me speak?</p>
          <p className="text-sm text-[--foreground-muted] mb-4">
            I&apos;m available for conferences, meetups, and internal team workshops.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[--primary] text-[--primary-foreground] text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get in Touch
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
