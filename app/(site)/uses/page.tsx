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

const STACK: Category[] = [
  {
    name: "Hardware",
    items: [
      { name: "MacBook Pro 14″ M3 Pro", desc: "My primary machine for design and development. Silent, fast, and the battery lasts all day." },
      { name: "LG UltraFine 27UN850", desc: "4K USB-C monitor. Color accuracy is excellent for design work without a separate hub." },
      { name: "Apple Magic Keyboard", desc: "Touch ID model with numeric keypad. Nothing fancy, but it just works." },
      { name: "Logitech MX Master 3S", desc: "Best mouse I've ever used. The horizontal scroll wheel alone is worth it." },
      { name: "Sony WH-1000XM5", desc: "ANC headphones for deep work sessions. The noise cancellation is remarkable." },
      { name: "iPad Pro 12.9″ M2", desc: "Secondary screen via Sidecar, reading, and sketching wireframes with the Apple Pencil." },
    ],
  },
  {
    name: "Development",
    items: [
      { name: "VS Code", desc: "Editor of choice. Dracula Pro theme + Geist Mono font.", url: "https://code.visualstudio.com" },
      { name: "Warp Terminal", desc: "Modern terminal with AI autocomplete and block-based output.", url: "https://www.warp.dev" },
      { name: "TablePlus", desc: "Clean GUI for Postgres, MySQL, and Redis. Replaces a dozen clunkier tools.", url: "https://tableplus.com" },
      { name: "Insomnia", desc: "REST/GraphQL API testing. Simpler than Postman for my workflow.", url: "https://insomnia.rest" },
      { name: "Fork", desc: "Git GUI I actually enjoy using. Fast, clear diff view.", url: "https://git-fork.com" },
      { name: "Raycast", desc: "Spotlight replacement. Clipboard history, snippets, and window management all in one.", url: "https://www.raycast.com" },
    ],
  },
  {
    name: "Design",
    items: [
      { name: "Figma", desc: "All UI/UX design and prototyping. Auto-layout and component properties changed how I work.", url: "https://figma.com" },
      { name: "Pixelmator Pro", desc: "Photo editing and the occasional illustration. Much lighter than Photoshop.", url: "https://www.pixelmator.com" },
      { name: "Framer", desc: "Interactive prototyping and design-to-production for landing pages.", url: "https://framer.com" },
      { name: "Fontbase", desc: "Font manager that activates only what I need so my system stays clean.", url: "https://fontba.se" },
    ],
  },
  {
    name: "Productivity",
    items: [
      { name: "Notion", desc: "My second brain. Projects, meeting notes, reading lists.", url: "https://notion.so" },
      { name: "Linear", desc: "Issue tracking for every project. The keyboard-first UX is a pleasure.", url: "https://linear.app" },
      { name: "Cron", desc: "Calendar app that finally makes scheduling feel fast.", url: "https://cron.com" },
      { name: "Readwise Reader", desc: "Read-later + RSS in one app. Highlights sync back to Notion automatically.", url: "https://readwise.io/read" },
      { name: "1Password", desc: "Password manager. The family plan is worth every dollar.", url: "https://1password.com" },
      { name: "CleanMyMac X", desc: "Annual maintenance ritual. Keeps my disk from silently filling up.", url: "https://cleanmymac.com" },
    ],
  },
  {
    name: "Services",
    items: [
      { name: "Vercel", desc: "Deploy everything here. Edge network, preview deployments, and KV storage are hard to beat.", url: "https://vercel.com" },
      { name: "Cloudflare", desc: "DNS, CDN, and R2 for asset storage.", url: "https://cloudflare.com" },
      { name: "Resend", desc: "Transactional emails. Clean API and generous free tier.", url: "https://resend.com" },
      { name: "Fathom Analytics", desc: "Privacy-first analytics. Single number per page, no cookie banners.", url: "https://usefathom.com" },
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
