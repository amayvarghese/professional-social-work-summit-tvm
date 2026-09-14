import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Share images are served from /api/image/[id] with immutable caching.
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
