// next.config.ts
import withPWA from "next-pwa";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["res.cloudinary.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

// ✅ PWA Config - ONLY PWA-related options here
const withPWAConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  scope: "/app",
  // sw: "service-worker.js", // if you use a custom SW
});

// ✅ Merge the two
export default withPWAConfig(nextConfig);
