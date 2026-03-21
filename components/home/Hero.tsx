import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 text-sm text-[--foreground-muted] mb-6 px-3 py-1 rounded-full border border-[--border] bg-[--background-secondary]">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Available for new projects
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[--foreground] mb-6 leading-tight">
          Hi, I&apos;m Jose Leos.
          <br />
          <span className="text-[--primary]">I design &amp; build</span>
          <br />
          digital things.
        </h1>
        <p className="text-lg text-[--foreground-muted] mb-8 leading-relaxed max-w-xl">
          Designer, developer, and occasional writer. I craft thoughtful digital experiences,
          share what I&apos;m learning, and recommend things I genuinely love.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[--primary] text-[--primary-foreground] font-medium text-sm hover:opacity-90 transition-opacity"
          >
            View My Work
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[--border] text-[--foreground] font-medium text-sm hover:bg-[--background-secondary] transition-colors"
          >
            <Download size={16} />
            Download CV
          </Link>
        </div>
      </div>
    </section>
  );
}
