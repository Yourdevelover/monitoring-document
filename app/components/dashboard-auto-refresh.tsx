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
    if (!pathname.startsWith("/dashboard")) return;

    let isRedirecting = false;

    const checkSession = async () => {
      if (isRedirecting || document.visibilityState !== "visible") return;
      try {
        const response = await fetch("/api/session/status", { cache: "no-store" });
        const result = await response.json() as { status?: string };
        if (result.status !== "active") {
          isRedirecting = true;
          router.replace(result.status === "disabled" ? "/?account=disabled" : "/?account=session-expired");
        }
      } catch {
        // Keep the current view when a transient network failure prevents the status check.
      }
    };

    const refreshDashboard = () => {
      if (document.visibilityState !== "visible") return;
      void checkSession();
      if (dashboardHomePaths.has(pathname)) router.refresh();
    };

    void checkSession();
    const intervalId = window.setInterval(refreshDashboard, 10_000);
    document.addEventListener("visibilitychange", refreshDashboard);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshDashboard);
    };
  }, [pathname, router]);

  return null;
}