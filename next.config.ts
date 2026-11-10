import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/dashboard/leader/pengumuman", destination: "/dashboard/leader/announcement", permanent: false },
      { source: "/dashboard/karyawan/pengumuman", destination: "/dashboard/karyawan/announcement", permanent: false },
      { source: "/dashboard/manajer/pengumuman", destination: "/dashboard/leader/announcement", permanent: false },
      { source: "/dashboard/manajer", destination: "/dashboard/leader", permanent: false },
      { source: "/dashboard/manajer/:path*", destination: "/dashboard/leader/:path*", permanent: false },
      { source: "/dashboard/admin/managers", destination: "/dashboard/admin/leaders", permanent: false },
      { source: "/dashboard/admin/managers/:path*", destination: "/dashboard/admin/leaders/:path*", permanent: false },
      { source: "/api/manager/:path*", destination: "/api/leader/:path*", permanent: false },
      { source: "/api/manajer/:path*", destination: "/api/leader/:path*", permanent: false },
      { source: "/api/admin/managers/:path*", destination: "/api/admin/leaders/:path*", permanent: false },
      { source: "/daftar-manajer", destination: "/daftar-leader", permanent: false },
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
