import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable all caching during development
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
