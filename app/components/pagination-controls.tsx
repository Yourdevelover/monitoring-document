"use client";

import Link from "next/link";

type PaginationControlsProps = {
  basePath: string;
  page: number;
  totalItems: number;
  pageSize?: number;
  query?: Record<string, string | undefined>;
};

export function PaginationControls({
  basePath,
  page,
  totalItems,
  pageSize = 6,
  query = {},
}: PaginationControlsProps) {
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
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e7eb] pt-4 text-sm">
        <div className="flex items-center gap-2 text-[#6b7280]">
          Jumlah data:
          <span className="text-[#6b7280]">{pageSize} data per halaman</span>
        </div>
      <div className="flex items-center gap-2">
        <span className="text-[#6b7280]">Halaman</span>
        {page > 1 && (
          <Link href={buildUrl(page - 1)} className="border border-[#e5e7eb] px-3 py-1 hover:bg-[#f8f9fa]">
            Sebelumnya
          </Link>
        )}
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
          <Link
            key={pageNumber}
            href={buildUrl(pageNumber)}
            aria-current={pageNumber === page ? "page" : undefined}
            className={pageNumber === page
              ? "border border-[#111111] bg-[#111111] px-3 py-1 text-white"
              : "border border-[#e5e7eb] px-3 py-1 hover:bg-[#f8f9fa]"}
          >
            {pageNumber}
          </Link>
        ))}
        {page < totalPages && (
          <Link href={buildUrl(page + 1)} className="border border-[#e5e7eb] px-3 py-1 hover:bg-[#f8f9fa]">
            Berikutnya
          </Link>
        )}
      </div>
    </div>
  );
}
