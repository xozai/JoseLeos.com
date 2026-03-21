/**
 * StarRating — pure presentational, no "use client" needed.
 *
 * @param rating   1–10 integer stored in WP (displayed as /5 with 0.5 increments)
 * @param size     "sm" | "md" | "lg"   (default "md")
 * @param showLabel  show numeric "4.5 / 5" beside the stars
 */

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const SIZE = {
  sm: { star: 12, gap: "gap-0.5", text: "text-xs" },
  md: { star: 16, gap: "gap-1",   text: "text-sm" },
  lg: { star: 22, gap: "gap-1.5", text: "text-base" },
};

export default function StarRating({ rating, size = "md", showLabel = false }: StarRatingProps) {
  // rating is 1-10; convert to 0.0–5.0 in 0.5 steps
  const score = Math.min(5, Math.max(0, Math.round(rating) / 2));
  const { star, gap, text } = SIZE[size];

  const stars = Array.from({ length: 5 }, (_, i) => {
    const full  = score >= i + 1;
    const half  = !full && score >= i + 0.5;
    return { full, half, empty: !full && !half };
  });

  return (
    <span className={`inline-flex items-center ${gap}`} aria-label={`${score} out of 5 stars`}>
      {stars.map((s, i) => (
        <svg
          key={i}
          width={star}
          height={star}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {s.half ? (
            // Half-star: filled left half via clip path
            <>
              <defs>
                <clipPath id={`half-${i}-${star}`}>
                  <rect x="0" y="0" width="12" height="24" />
                </clipPath>
              </defs>
              {/* empty background */}
              <polygon
                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill="var(--border)"
              />
              {/* filled left half */}
              <polygon
                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill="var(--primary)"
                clipPath={`url(#half-${i}-${star})`}
              />
            </>
          ) : (
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={s.full ? "var(--primary)" : "var(--border)"}
            />
          )}
        </svg>
      ))}
      {showLabel && (
        <span className={`ml-1 tabular-nums text-[--foreground-muted] ${text}`}>
          {score % 1 === 0 ? `${score}.0` : score} / 5
        </span>
      )}
    </span>
  );
}
