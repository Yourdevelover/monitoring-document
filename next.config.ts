import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/dashboard/leader/pengumuman", destination: "/dashboard/leader/announcement", permanent: false },
      { source: "/dashboard/karyawan/pengumuman", destination: "/dashboard/karyawan/announcement", permanent: false },
      { source: "/dashboard/manajer/pengumuman", destination: "/dashboard/manajer/announcement", permanent: false },
    ];
  },
  turbopack: {
    root: __dirname,
  },
  // Allow Next.js dev resources (HMR) from LAN IP used in browser
  allowedDevOrigins: ["10.248.186.186"],
  images: {
    localPatterns: [
      { pathname: "/logo/**" },
    ],
  },
};

export default nextConfig;
