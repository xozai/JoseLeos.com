import type { Metadata } from "next";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Providers from "@/components/layout/Providers";
import { SITE_URL, SITE_NAME, TWITTER_HANDLE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Designer & Developer`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Personal website of Jose Leos. Portfolio, blog, and curated recommendations.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [{ url: "/api/og?title=Jose+Leos&type=home", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    creator: TWITTER_HANDLE,
  },
  robots: { index: true, follow: true },
  alternates: {
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
};

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium focus:bg-[--primary] focus:text-[--primary-foreground]"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
        {plausibleDomain && (
          <Script
            src="https://plausible.io/js/script.js"
            data-domain={plausibleDomain}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
