import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Allow Next.js dev resources (HMR) from LAN IP used in browser
  allowedDevOrigins: ["10.248.186.186"],
};

export default nextConfig;
