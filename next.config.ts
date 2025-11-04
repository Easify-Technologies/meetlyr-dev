import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["example.com"],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
