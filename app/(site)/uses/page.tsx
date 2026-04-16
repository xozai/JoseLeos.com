import type { Metadata } from "next";
import FadeIn from "@/components/ui/FadeIn";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Uses",
  description: "The hardware, software, and tools Jose Leos uses every day.",
  openGraph: {
    images: [{ url: "/api/og?title=Uses&type=page", width: 1200, height: 630 }],
  },
};

interface Category {
  name: string;
  items: { name: string; desc: string; url?: string }[];
}

// TODO: Replace each category with your actual hardware, software, and services
const STACK: Category[] = [
  {
    name: "Hardware",
    items: [
      { name: "TODO: Primary computer", desc: "TODO: Why you like it." },
      { name: "TODO: Monitor", desc: "TODO: Why you like it." },
      { name: "TODO: Keyboard", desc: "TODO: Why you like it." },
      { name: "TODO: Pointing device", desc: "TODO: Why you like it." },
    ],
  },
  {
    name: "Development",
    items: [
      { name: "TODO: Code editor", desc: "TODO: Theme, font, notable extensions." },
      { name: "TODO: Terminal", desc: "TODO: Why you use it." },
      { name: "TODO: Database tool", desc: "TODO: Why you use it." },
      { name: "TODO: API client", desc: "TODO: Why you use it." },
    ],
  },
  {
    name: "Design",
    items: [
      { name: "TODO: Design tool", desc: "TODO: What you use it for." },
      { name: "TODO: Image editor", desc: "TODO: What you use it for." },
    ],
  },
  {
    name: "Productivity",
    items: [
      { name: "TODO: Notes app", desc: "TODO: How you use it." },
      { name: "TODO: Task manager", desc: "TODO: How you use it." },
      { name: "TODO: Calendar", desc: "TODO: How you use it." },
    ],
  },
  {
    name: "Services",
    items: [
      { name: "TODO: Hosting", desc: "TODO: Why you chose it." },
      { name: "TODO: DNS / CDN", desc: "TODO: Why you chose it." },
      { name: "TODO: Email service", desc: "TODO: Why you chose it." },
    ],
  },
];

export default function UsesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <FadeIn>
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-[--foreground] mb-4">Uses</h1>
          <p className="text-lg text-[--foreground-muted] leading-relaxed">
            The hardware and software I rely on every day — updated periodically as things change.
            Inspired by <a href="https://uses.tech" target="_blank" rel="noopener noreferrer" className="text-[--primary] hover:underline">uses.tech</a>.
          </p>
        </header>
      </FadeIn>

      <div className="space-y-14">
        {STACK.map((category, ci) => (
          <FadeIn key={category.name} index={ci}>
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[--foreground-muted] mb-5 pb-2 border-b border-[--border]">
                {category.name}
              </h2>
              <div className="space-y-6">
                {category.items.map((item) => (
                  <div key={item.name} className="flex gap-4">
                    <div className="min-w-0 flex-1">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[--foreground] hover:text-[--primary] transition-colors"
                        >
                          {item.name}
                        </a>
                      ) : (
                        <p className="font-medium text-[--foreground]">{item.name}</p>
                      )}
                      <p className="text-sm text-[--foreground-muted] mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.3}>
        <div className="mt-16 rounded-xl border border-[--border] bg-[--background-secondary] p-6 text-center">
          <p className="text-sm text-[--foreground-muted] mb-3">
            Have a tool recommendation? I&apos;d love to hear about it.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[--primary] text-[--primary-foreground] text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get in Touch
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
