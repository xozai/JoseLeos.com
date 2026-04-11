import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { SITE_URL } from "@/lib/site";

const SITE_HOSTNAME = new URL(SITE_URL).hostname;

export const runtime = "edge";

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

function renderStars(ratingStr: string | null): string | null {
  if (!ratingStr) return null;
  const raw = parseFloat(ratingStr);
  if (isNaN(raw) || raw <= 0) return null;
  const score = Math.min(5, Math.max(0, raw / 2));
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

  const formattedDate = formatOgDate(dateStr);
  const stars = type === "review" ? renderStars(rating) : null;
  const descriptor = [category, readingTime, formattedDate].filter(Boolean).join(" · ");

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
          background: "#0f0f0f",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Right edge stripe */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 4,
            height: "100%",
            background: "rgba(255,255,255,0.06)",
          }}
        />

        {/* Top: name */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            JOSE LEOS
          </div>
          {descriptor && (
            <div
              style={{
                fontSize: 20,
                color: "#9ca3af",
                fontWeight: 400,
                letterSpacing: "0",
              }}
            >
              {descriptor}
            </div>
          )}
        </div>

        {/* Middle: title + stars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: title.length > 50 ? 40 : title.length > 30 ? 50 : 60,
              fontWeight: 800,
              color: "#f0f0f0",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              maxWidth: "88%",
            }}
          >
            {title}
          </div>
          {stars && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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

        {/* Bottom: hostname */}
        <div
          style={{
            fontSize: 12,
            color: "#5f5e5e",
            fontFamily: "monospace",
            letterSpacing: "0.05em",
          }}
        >
          {SITE_HOSTNAME}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
