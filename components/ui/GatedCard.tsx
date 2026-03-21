import Link from "next/link";
import { Lock } from "lucide-react";

interface GatedCardProps {
  type: "post" | "project" | "recommendation";
  className?: string;
}

export default function GatedCard({ type, className = "" }: GatedCardProps) {
  const label = type === "post" ? "article" : type === "project" ? "project" : "recommendation";

  return (
    <div
      className={`relative rounded-xl border border-dashed border-[--border] p-6 flex flex-col items-center justify-center gap-3 min-h-[180px] text-center ${className}`}
    >
      <div className="w-9 h-9 rounded-full bg-[--background-secondary] flex items-center justify-center">
        <Lock size={16} className="text-[--foreground-muted]" />
      </div>
      <div>
        <p className="text-sm font-medium text-[--foreground]">Members only</p>
        <p className="text-xs text-[--foreground-muted] mt-0.5">
          Sign in to read this {label}.
        </p>
      </div>
      <Link
        href="/login"
        className="mt-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-[--border] text-[--foreground-muted] hover:text-[--foreground] hover:bg-[--background-secondary] transition-colors"
      >
        Sign in
      </Link>
    </div>
  );
}
