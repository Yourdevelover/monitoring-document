"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const dashboardHomePaths = new Set([
  "/dashboard/admin",
  "/dashboard/leader",
  "/dashboard/manajer",
  "/dashboard/karyawan",
]);

export function DashboardAutoRefresh() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!dashboardHomePaths.has(pathname)) return;

    const refreshDashboard = () => {
      if (document.visibilityState === "visible") router.refresh();
    };

    const intervalId = window.setInterval(refreshDashboard, 30_000);
    document.addEventListener("visibilitychange", refreshDashboard);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshDashboard);
    };
  }, [pathname, router]);

  return null;
}