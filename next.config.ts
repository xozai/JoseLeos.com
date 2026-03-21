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
    ],
  },
};

export default nextConfig;
