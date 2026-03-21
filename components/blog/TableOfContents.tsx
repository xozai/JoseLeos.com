"use client";

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

function parseHeadings(html: string): Heading[] {
  const matches = [...html.matchAll(/<h([23])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h[23]>/gi)];
  return matches.map((m) => ({
    level: Number(m[1]) as 2 | 3,
    id: m[2] || slugify(stripTags(m[3])),
    text: stripTags(m[3]),
  }));
}

function stripTags(s: string) {
  return s.replace(/<[^>]+>/g, "");
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function TableOfContents({ content }: { content: string }) {
  const headings = parseHeadings(content);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0px 0px -70% 0px" }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="hidden xl:block sticky top-24 w-56 shrink-0 self-start"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-[--foreground-muted] mb-3">
        On this page
      </p>
      <ul className="space-y-1.5">
        {headings.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block text-sm transition-colors leading-snug ${
                level === 3 ? "pl-3" : ""
              } ${
                activeId === id
                  ? "text-[--primary] font-medium"
                  : "text-[--foreground-muted] hover:text-[--foreground]"
              }`}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
