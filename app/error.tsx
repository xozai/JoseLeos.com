"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: "#0f0f0f", color: "#f0f0f0", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <p style={{ fontSize: "4rem", fontWeight: 900, color: "#3b82f6", marginBottom: "0.5rem" }}>500</p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>Something went wrong</h1>
            <p style={{ color: "#9ca3af", marginBottom: "2rem" }}>
              An unexpected error occurred. If this keeps happening, please{" "}
              <a href="/contact" style={{ color: "#3b82f6" }}>get in touch</a>.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{ padding: "0.5rem 1.25rem", borderRadius: "0.5rem", background: "#3b82f6", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600 }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{ padding: "0.5rem 1.25rem", borderRadius: "0.5rem", border: "1px solid #2a2a2a", color: "#f0f0f0", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
