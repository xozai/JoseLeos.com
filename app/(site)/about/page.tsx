import type { Metadata } from "next";
import Link from "next/link";
import { Download, Github, Twitter, Linkedin } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about Jose Leos — designer, developer, and writer.",
};

const SKILLS = [
  "TypeScript", "React", "Next.js", "Node.js",
  "Tailwind CSS", "Figma", "PostgreSQL", "GraphQL",
];

const TIMELINE = [
  { year: "2024–Present", role: "Senior Product Designer", org: "Company Name" },
  { year: "2022–2024", role: "Fullstack Developer", org: "Agency Name" },
  { year: "2020–2022", role: "UI/UX Designer", org: "Startup Name" },
  { year: "2016–2020", role: "B.S. Computer Science", org: "University Name" },
];

const SOCIAL = [
  { icon: Github, href: "https://github.com/joseleos", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com/joseleos", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com/in/joseleos", label: "LinkedIn" },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-[--foreground] mb-4">About Me</h1>
        <p className="text-lg text-[--foreground-muted] leading-relaxed">
          I&apos;m Jose Leos — a designer and developer with a passion for building clean, useful
          digital products. I write about design systems, web development, and the intersection
          of craft and technology.
        </p>
      </header>

      {/* Bio */}
      <section className="mb-12 space-y-4 text-[--foreground-muted] leading-relaxed">
        <p>
          Over the past several years I&apos;ve worked across the full stack — from designing
          component libraries in Figma to shipping production APIs. I care deeply about
          the details: typography, spacing, performance, and the tiny interactions that
          make software feel alive.
        </p>
        <p>
          Outside of work I&apos;m an avid reader, occasional photographer, and obsessive
          note-taker. This site is where I share my work, thinking, and the things I
          find genuinely useful.
        </p>
      </section>

      {/* Social Links */}
      <div className="flex gap-4 mb-12">
        {SOCIAL.map(({ icon: Icon, href, label }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[--border] text-sm text-[--foreground-muted] hover:text-[--foreground] hover:border-[--foreground-muted] transition-colors"
          >
            <Icon size={15} />
            {label}
          </a>
        ))}
        <a
          href="/cv.pdf"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[--primary] text-[--primary-foreground] text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Download size={15} />
          Download CV
        </a>
      </div>

      {/* Skills */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-[--foreground] mb-4">Skills & Tools</h2>
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 rounded-full text-sm border border-[--border] bg-[--background-secondary] text-[--foreground]"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-[--foreground] mb-6">Experience</h2>
        <div className="space-y-6 relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-[--border]">
          {TIMELINE.map(({ year, role, org }) => (
            <div key={year} className="pl-6 relative">
              <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-[--primary] -translate-x-1/2" />
              <p className="text-xs font-medium text-[--foreground-muted] mb-0.5">{year}</p>
              <p className="font-semibold text-[--foreground]">{role}</p>
              <p className="text-sm text-[--foreground-muted]">{org}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="rounded-xl border border-[--border] bg-[--background-secondary] p-6 text-center">
        <h3 className="font-semibold text-[--foreground] mb-2">Let&apos;s work together</h3>
        <p className="text-sm text-[--foreground-muted] mb-4">
          I&apos;m currently available for freelance projects and consulting.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[--primary] text-[--primary-foreground] text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Get in Touch
        </Link>
      </div>
    </div>
  );
}
