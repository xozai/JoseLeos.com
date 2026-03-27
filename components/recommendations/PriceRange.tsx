/** PriceRange — purely presentational server component */

type Range = "Free" | "$" | "$$" | "$$$" | "$$$$";

interface PriceRangeProps {
  range: string;
}

const TIERS: Record<string, number> = { "$": 1, "$$": 2, "$$$": 3, "$$$$": 4 };

export default function PriceRange({ range }: PriceRangeProps) {
  if (!range || range === "Free") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        Free
      </span>
    );
  }

  const filled = TIERS[range] ?? 0;
  const total  = 4;

  return (
    <span
      className="inline-flex items-center gap-px tabular-nums text-sm font-medium tracking-tight"
      aria-label={`Price range: ${range}`}
      title={`Price range: ${range}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={i < filled ? "text-[--foreground]" : "text-[--border]"}
        >
          $
        </span>
      ))}
    </span>
  );
}
