import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NewsletterCTA from "@/components/blog/NewsletterCTA";

export const metadata: Metadata = {
  title: "Subscribe",
  description:
    "Get new articles on design, development, and building things delivered straight to your inbox.",
  alternates: { canonical: "/subscribe" },
};

export default function SubscribePage() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link
        href="/newsletter"
        className="inline-flex items-center gap-1.5 text-sm text-[--foreground-muted] hover:text-[--foreground] mb-10 transition-colors"
      >
        <ArrowLeft size={14} /> Browse past issues
      </Link>

      <header className="mb-8">
        <h1 className="text-4xl font-bold text-[--foreground] mb-3">
          Get the newsletter
        </h1>
        <p className="text-lg text-[--foreground-muted]">
          Occasional articles on design, development, and things I&apos;m
          figuring out — delivered straight to your inbox. No spam, unsubscribe
          anytime.
        </p>
      </header>

      <NewsletterCTA />
    </div>
  );
}
