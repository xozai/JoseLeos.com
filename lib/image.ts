/**
 * Generates a tiny SVG shimmer encoded as a base64 data URL for use as
 * next/image placeholder="blur" blurDataURL on remote images.
 */
function shimmerSvg(w: number, h: number) {
  return `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#e5e7eb" stop-opacity="1" />
      <stop offset="50%"  stop-color="#f3f4f6" stop-opacity="1" />
      <stop offset="100%" stop-color="#e5e7eb" stop-opacity="1" />
      <animateTransform attributeName="gradientTransform" type="translate"
        values="-100 0;100 0;-100 0" dur="1.6s" repeatCount="indefinite"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)" />
</svg>`;
}

function toBase64(str: string) {
  if (typeof window === "undefined") {
    return Buffer.from(str).toString("base64");
  }
  return window.btoa(unescape(encodeURIComponent(str)));
}

/** Pass this as `blurDataURL` on any remote next/image. */
export const shimmerDataURL = (w = 700, h = 475) =>
  `data:image/svg+xml;base64,${toBase64(shimmerSvg(w, h))}`;

/** Convenience props to spread onto a next/image for remote images. */
export const blurProps = {
  placeholder: "blur" as const,
  blurDataURL: shimmerDataURL(),
};
