import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") ?? "Jose Leos";
  const type = searchParams.get("type") ?? "page";

  const typeLabel: Record<string, string> = {
    blog: "Blog Post",
    portfolio: "Case Study",
    home: "joseLeos.com",
    page: "joseLeos.com",
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "60px",
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Label */}
        <div
          style={{
            fontSize: 18,
            color: "#3b82f6",
            fontWeight: 600,
            marginBottom: 16,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {typeLabel[type] ?? "joseLeos.com"}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 40 ? 42 : 54,
            fontWeight: 800,
            color: "#f0f0f0",
            lineHeight: 1.15,
            maxWidth: "80%",
          }}
        >
          {title}
        </div>

        {/* Author */}
        <div
          style={{
            marginTop: 36,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            JL
          </div>
          <div style={{ color: "#9ca3af", fontSize: 18 }}>joseLeos.com</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
