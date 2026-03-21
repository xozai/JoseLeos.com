"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface CalendlyWidgetProps {
  /** Height of the inline embed in pixels (default 700) */
  height?: number;
}

export default function CalendlyWidget({ height = 700 }: CalendlyWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  // Once the Calendly script is ready, re-init the widget so it finds our div
  useEffect(() => {
    if (!loaded) return;
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Calendly = (window as any).Calendly;
    if (Calendly?.initInlineWidgets) {
      Calendly.initInlineWidgets();
    }
  }, [loaded]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-[--border]" style={{ minHeight: height }}>
      {/* Shimmer shown while Calendly iframe loads */}
      {!loaded && (
        <div
          className="absolute inset-0 z-10 animate-pulse bg-[--background-secondary]"
          aria-hidden="true"
        />
      )}

      {/* Calendly inline embed target */}
      <div
        ref={containerRef}
        className="calendly-inline-widget w-full"
        data-url="https://calendly.com/joseleos"
        style={{ minWidth: 320, height }}
      />

      {/* Lazy-load the Calendly script only when this component renders */}
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
