import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable all caching during development
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
