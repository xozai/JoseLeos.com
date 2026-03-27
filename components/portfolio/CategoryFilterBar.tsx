import Link from "next/link";
import { cn } from "@/lib/utils";

interface CategoryFilterBarProps {
  categories: string[];
  active: string | undefined;
}

export default function CategoryFilterBar({ categories, active }: CategoryFilterBarProps) {
  if (categories.length === 0) return null;

  const all = ["All", ...categories];

  return (
    <div className="flex flex-wrap gap-2 mb-10" role="navigation" aria-label="Filter by category">
      {all.map((cat) => {
        const isActive = cat === "All" ? !active : active === cat;
        const href = cat === "All" ? "/portfolio" : `/portfolio?category=${encodeURIComponent(cat)}`;
        return (
          <Link
            key={cat}
            href={href}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
              isActive
                ? "bg-[--primary] text-[--primary-foreground] border-[--primary]"
                : "border-[--border] text-[--foreground-muted] hover:text-[--foreground] hover:border-[--foreground-muted]"
            )}
          >
            {cat}
          </Link>
        );
      })}
    </div>
  );
}
