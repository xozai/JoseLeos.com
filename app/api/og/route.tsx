import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const TYPE_LABEL: Record<string, string> = {
  blog: "Blog Post",
  portfolio: "Case Study",
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

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") ?? "Jose Leos";
  const type = searchParams.get("type") ?? "page";
  const dateStr = searchParams.get("date");
  const category = searchParams.get("category");
  const readingTime = searchParams.get("readingTime");

  const typeLabel = TYPE_LABEL[type] ?? "joseLeos.com";
  const formattedDate = formatOgDate(dateStr);

  const metaParts = [category, readingTime, formattedDate].filter(Boolean) as string[];

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
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: type label */}
        <div
          style={{
            fontSize: 16,
            color: "#3b82f6",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          {typeLabel}
        </div>

        {/* Middle: title */}
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
                background: "#3b82f6",
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

          {/* Meta: category · reading time · date */}
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
              {metaParts.map((part, i) => (
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
