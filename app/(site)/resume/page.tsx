import type { Metadata } from "next";
import Link from "next/link";
import { Download, MapPin, Mail, Globe } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Resume",
  description: "Professional resume of Jose Leos — designer and developer.",
  openGraph: {
    images: [{ url: "/api/og?title=Resume&type=page", width: 1200, height: 630 }],
  },
};

const EXPERIENCE = [
  {
    role: "Senior Product Designer",
    org: "Company Name",
    period: "2024 – Present",
    location: "Remote",
    bullets: [
      "Led redesign of the core product dashboard, reducing task completion time by 34%.",
      "Established a Figma-based design system covering 120+ components used by 4 engineers.",
      "Partnered with product and engineering on a 0→1 mobile app launch (React Native).",
    ],
  },
  {
    role: "Fullstack Developer",
    org: "Agency Name",
    period: "2022 – 2024",
    location: "Hybrid",
    bullets: [
      "Built and maintained 8 client sites using Next.js, TypeScript, and headless CMS.",
      "Introduced performance budgets and automated Lighthouse CI — average score improved from 68 → 94.",
      "Mentored two junior developers through code review and pair programming sessions.",
    ],
  },
  {
    role: "UI/UX Designer",
    org: "Startup Name",
    period: "2020 – 2022",
    location: "On-site",
    bullets: [
      "Designed end-to-end UX for a SaaS analytics product from 0 to Series A (10k users).",
      "Conducted 60+ user interviews; findings directly shaped 3 major product pivots.",
      "Owned design → dev handoff process, cutting implementation mismatches by 50%.",
    ],
  },
];

const EDUCATION = [
  {
    degree: "B.S. Computer Science",
    school: "University Name",
    period: "2016 – 2020",
    note: "Minor in Human-Computer Interaction. Graduated with honors.",
  },
];

const SKILLS = {
  Design: ["Figma", "Framer", "Prototyping", "User Research", "Design Systems", "Accessibility"],
  Frontend: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Framer Motion", "Storybook"],
  Backend: ["Node.js", "PostgreSQL", "GraphQL", "REST APIs", "Vercel", "Cloudflare Workers"],
  Tools: ["Git", "Linear", "Notion", "VS Code", "Warp", "TablePlus"],
};

export default function ResumePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <FadeIn>
        <header className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-[--foreground] mb-1">Jose Leos</h1>
              <p className="text-xl text-[--foreground-muted] mb-4">Designer &amp; Developer</p>
              <div className="flex flex-wrap gap-4 text-sm text-[--foreground-muted]">
                <span className="flex items-center gap-1.5"><MapPin size={13} /> Remote / [City]</span>
                <a href="mailto:jose@joseLeos.com" className="flex items-center gap-1.5 hover:text-[--primary] transition-colors">
                  <Mail size={13} /> jose@joseLeos.com
                </a>
                <Link href="/" className="flex items-center gap-1.5 hover:text-[--primary] transition-colors">
                  <Globe size={13} /> joseLeos.com
                </Link>
              </div>
            </div>
            <a
              href="/cv.pdf"
              className="inline-flex shrink-0 items-center gap-2 px-5 py-2.5 rounded-lg bg-[--primary] text-[--primary-foreground] font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Download size={15} />
              Download PDF
            </a>
          </div>
        </header>
      </FadeIn>

      {/* Summary */}
      <FadeIn delay={0.06}>
        <section className="mb-12">
          <h2 className="section-heading">Summary</h2>
          <p className="text-[--foreground-muted] leading-relaxed">
            Designer and developer with 6+ years building digital products end-to-end. I work across
            the full stack — from early-stage research and wireframing to shipping production code.
            I care deeply about clarity, performance, and the small details that make software feel
            intentional. Looking for ambitious product teams where design and engineering overlap.
          </p>
        </section>
      </FadeIn>

      {/* Experience */}
      <section className="mb-12">
        <FadeIn delay={0.1}>
          <h2 className="section-heading">Experience</h2>
        </FadeIn>
        <div className="space-y-10">
          {EXPERIENCE.map((job, i) => (
            <FadeIn key={job.org + job.period} index={i} delay={0.12}>
              <div>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-3">
                  <div>
                    <p className="font-semibold text-[--foreground]">{job.role}</p>
                    <p className="text-sm text-[--foreground-muted]">{job.org} · {job.location}</p>
                  </div>
                  <span className="text-sm text-[--foreground-muted] shrink-0">{job.period}</span>
                </div>
                <ul className="space-y-1.5 pl-4">
                  {job.bullets.map((b) => (
                    <li key={b} className="text-sm text-[--foreground-muted] leading-relaxed list-disc list-outside marker:text-[--primary]">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-12">
        <FadeIn delay={0.2}>
          <h2 className="section-heading">Education</h2>
        </FadeIn>
        {EDUCATION.map((ed, i) => (
          <FadeIn key={ed.school} index={i} delay={0.22}>
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <div>
                <p className="font-semibold text-[--foreground]">{ed.degree}</p>
                <p className="text-sm text-[--foreground-muted]">{ed.school}</p>
                {ed.note && <p className="text-sm text-[--foreground-muted] mt-0.5">{ed.note}</p>}
              </div>
              <span className="text-sm text-[--foreground-muted] shrink-0">{ed.period}</span>
            </div>
          </FadeIn>
        ))}
      </section>

      {/* Skills */}
      <FadeIn delay={0.26}>
        <section className="mb-12">
          <h2 className="section-heading">Skills</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {Object.entries(SKILLS).map(([category, skills]) => (
              <div key={category}>
                <p className="text-xs font-semibold uppercase tracking-wider text-[--foreground-muted] mb-2">
                  {category}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-0.5 rounded-full text-xs border border-[--border] bg-[--background-secondary] text-[--foreground]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* CTA */}
      <FadeIn delay={0.3}>
        <div className="rounded-xl border border-[--border] bg-[--background-secondary] p-6 text-center">
          <p className="text-sm text-[--foreground-muted] mb-4">
            Want to see my work in action? Browse my portfolio or get in touch.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[--primary] text-[--primary-foreground] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              View Portfolio
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-5 py-2 rounded-lg border border-[--border] text-[--foreground] text-sm font-medium hover:bg-[--background] transition-colors"
            >
              Contact Me
            </Link>
          </div>
        </div>
      </FadeIn>

      <style>{`
        .section-heading {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--foreground-muted);
          margin-bottom: 1.25rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border);
        }
      `}</style>
    </div>
  );
}
