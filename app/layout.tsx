import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Providers from "@/components/layout/Providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://joseLeos.com"),
  title: {
    default: "Jose Leos — Designer & Developer",
    template: "%s | Jose Leos",
  },
  description:
    "Personal website of Jose Leos. Portfolio, blog, and curated recommendations.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://joseLeos.com",
    siteName: "Jose Leos",
    images: [{ url: "/api/og?title=Jose+Leos&type=home", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@joseleos",
  },
  robots: { index: true, follow: true },
  alternates: {
    types: { "application/rss+xml": "https://joseLeos.com/feed.xml" },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
