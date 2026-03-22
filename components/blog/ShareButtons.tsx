"use client";

import { useState } from "react";
import { Twitter, Linkedin, Facebook, Link2, Check } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  slug: string;
  /** URL path section — defaults to "blog". Pass "recommendations" for review pages. */
  section?: string;
}

export default function ShareButtons({ title, slug, section = "blog" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://joseleos.com";
  const url = `${base}/${section}/${slug}`;

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  const btnClass =
    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[--border] text-sm text-[--foreground-muted] hover:text-[--foreground] hover:border-[--primary] hover:bg-[--background-secondary] transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-2 my-8">
      <span className="text-sm text-[--foreground-muted] mr-1">Share:</span>

      <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className={btnClass}>
        <Twitter size={13} />
        X
      </a>

      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className={btnClass}>
        <Linkedin size={13} />
        LinkedIn
      </a>

      <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className={btnClass}>
        <Facebook size={13} />
        Facebook
      </a>

      <button onClick={copyLink} className={btnClass}>
        {copied ? <Check size={13} className="text-green-500" /> : <Link2 size={13} />}
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
