"use client";

import { useState } from "react";
import { Twitter, Linkedin, Link as LinkIcon, Check } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export default function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = `https://joseLeos.com/blog/${slug}`;

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-2 mt-8">
      <span className="text-sm text-[--foreground-muted] mr-1">Share:</span>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[--border] text-sm text-[--foreground-muted] hover:text-[--foreground] hover:bg-[--background-secondary] transition-colors"
      >
        <Twitter size={13} />
        X
      </a>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[--border] text-sm text-[--foreground-muted] hover:text-[--foreground] hover:bg-[--background-secondary] transition-colors"
      >
        <Linkedin size={13} />
        LinkedIn
      </a>
      <button
        onClick={copyLink}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[--border] text-sm text-[--foreground-muted] hover:text-[--foreground] hover:bg-[--background-secondary] transition-colors"
      >
        {copied ? <Check size={13} className="text-green-500" /> : <LinkIcon size={13} />}
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
