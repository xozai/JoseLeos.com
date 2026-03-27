import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const TYPE_LABEL: Record<string, string> = {
  blog: "Blog Post",
  portfolio: "Case Study",
  review: "Review",
  home: "joseLeos.com",
  page: "joseLeos.com",
};

function formatOgDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

/** Render star glyphs for a rating 1–10 (stored as int, displayed as /5) */
function renderStars(ratingStr: string | null): string | null {
  if (!ratingStr) return null;
  const raw = parseFloat(ratingStr);
  if (isNaN(raw) || raw <= 0) return null;
  const score = Math.min(5, Math.max(0, raw / 2)); // 1-10 → 0.5-5
  const full = Math.floor(score);
  const half = score - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") ?? "Jose Leos";
  const type = searchParams.get("type") ?? "page";
  const dateStr = searchParams.get("date");
  const category = searchParams.get("category");
  const readingTime = searchParams.get("readingTime");
  const rating = searchParams.get("rating");

  const typeLabel = TYPE_LABEL[type] ?? "joseLeos.com";
  const formattedDate = formatOgDate(dateStr);
  const stars = type === "review" ? renderStars(rating) : null;

  const metaParts = [category, readingTime, formattedDate].filter(Boolean) as string[];

  const isReview = type === "review";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 60px",
          background: isReview
            ? "linear-gradient(135deg, #0f0f0f 0%, #1a1215 100%)"
            : "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: type label */}
        <div
          style={{
            fontSize: 16,
            color: isReview ? "#f59e0b" : "#3b82f6",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          {typeLabel}
          {category ? ` · ${category}` : ""}
        </div>

        {/* Middle: title + stars for reviews */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: title.length > 50 ? 40 : title.length > 30 ? 50 : 60,
              fontWeight: 800,
              color: "#f0f0f0",
              lineHeight: 1.15,
              maxWidth: "85%",
            }}
          >
            {title}
          </div>
          {stars && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 28, color: "#f59e0b", letterSpacing: 2 }}>
                {stars}
              </span>
              {rating && (
                <span style={{ fontSize: 18, color: "#9ca3af", fontWeight: 600 }}>
                  {(parseFloat(rating) / 2).toFixed(1)} / 5
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bottom: author + meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Author */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: isReview ? "#f59e0b" : "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: 17,
              }}
            >
              JL
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ color: "#f0f0f0", fontSize: 17, fontWeight: 600 }}>Jose Leos</span>
              <span style={{ color: "#6b7280", fontSize: 14 }}>joseLeos.com</span>
            </div>
          </div>

          {/* Meta: reading time · date */}
          {metaParts.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#6b7280",
                fontSize: 15,
              }}
            >
              {metaParts
                .filter((p) => p !== category) // category already in type label
                .map((part, i) => (
                  <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {i > 0 && <span style={{ color: "#374151" }}>·</span>}
                    {part}
                  </span>
                ))}
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
