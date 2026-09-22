"use client";

import Link from "next/link";

type PaginationControlsProps = {
  basePath: string;
  page: number;
  totalItems: number;
  query?: Record<string, string | undefined>;
};

export function PaginationControls({
  basePath,
  page,
  totalItems,
  query = {},
}: PaginationControlsProps) {
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems === 0) return null;

  const buildUrl = (nextPage: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(nextPage));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          Jumlah data:
          <span className="text-slate-500">6 data per halaman</span>
        </div>
      <div className="flex items-center gap-2">
        <span className="text-slate-500">Halaman</span>
        {page > 1 && (
          <Link href={buildUrl(page - 1)} className="border border-slate-300 px-3 py-1 hover:bg-slate-50">
            Sebelumnya
          </Link>
        )}
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
          <Link
            key={pageNumber}
            href={buildUrl(pageNumber)}
            aria-current={pageNumber === page ? "page" : undefined}
            className={pageNumber === page
              ? "border border-slate-900 bg-slate-900 px-3 py-1 text-white"
              : "border border-slate-300 px-3 py-1 hover:bg-slate-50"}
          >
            {pageNumber}
          </Link>
        ))}
        {page < totalPages && (
          <Link href={buildUrl(page + 1)} className="border border-slate-300 px-3 py-1 hover:bg-slate-50">
            Berikutnya
          </Link>
        )}
      </div>
    </div>
  );
}
