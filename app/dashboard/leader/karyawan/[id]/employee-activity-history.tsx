"use client";

import { useState } from "react";

type Activity = {
  id: number;
  description: string;
  createdAt: string;
};

type ActivityPage = {
  activities: Activity[];
  page: number;
  totalPages: number;
  totalItems: number;
};

export function EmployeeActivityHistory({
  employeeId,
  initialPage,
}: {
  employeeId: number;
  initialPage: ActivityPage;
}) {
  const [activityPage, setActivityPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadPage(page: number) {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/leader/employee/${employeeId}/activities?page=${page}`, {
        cache: "no-store",
      });
      const result = await response.json() as ActivityPage & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Aktivitas gagal dimuat.");
      setActivityPage(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Aktivitas gagal dimuat.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div aria-live="polite" className="divide-y divide-[#f1f3f5] px-4">
        {activityPage.activities.map((activity) => (
          <div key={activity.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#111111]">{activity.description}</p>
            <time dateTime={activity.createdAt} className="shrink-0 text-[11px] tabular-nums text-[#6b7280]">
              {new Date(activity.createdAt).toLocaleString("id-ID")}
            </time>
          </div>
        ))}
        {activityPage.activities.length === 0 && !error && <p className="py-4 text-xs text-[#6b7280]">Belum ada aktivitas tambahan.</p>}
        {error && <p role="alert" className="py-4 text-xs text-[#9f2f2d]">{error}</p>}
      </div>
      {activityPage.totalItems > 0 && (
        <nav aria-label="Navigasi halaman aktivitas" className="flex items-center justify-between gap-3 border-t border-[#e5e7eb] px-4 py-3 text-xs">
          <span className="text-[#6b7280]">Halaman {activityPage.page} dari {activityPage.totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadPage(activityPage.page - 1)}
              disabled={isLoading || activityPage.page === 1}
              className="inline-flex h-8 items-center rounded-md border border-[#e5e7eb] px-3 font-medium text-[#374151] hover:bg-[#f8f9fa] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sebelumnya
            </button>
            {activityPage.page < activityPage.totalPages && (
              <button
                type="button"
                onClick={() => void loadPage(activityPage.page + 1)}
                disabled={isLoading}
                className="inline-flex h-8 items-center rounded-md border border-[#e5e7eb] px-3 font-medium text-[#374151] hover:bg-[#f8f9fa] disabled:opacity-50"
              >
                {isLoading ? "Memuat..." : "Berikutnya"}
              </button>
            )}
          </div>
        </nav>
      )}
    </>
  );
}