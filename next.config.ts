import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.wordpress.com",
      },
      {
        protocol: "https",
        hostname: "secure.gravatar.com",
      },
      // Replace with your actual WP media host
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_WP_MEDIA_HOSTNAME ?? "cms.joseLeos.com",
      },
      // Instagram Basic Display API media CDN
      {
        protocol: "https",
        hostname: "graph.instagram.com",
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
    ],
  },
};

export default nextConfig;
