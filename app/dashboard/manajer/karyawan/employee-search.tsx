"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export function EmployeeSearch({ initialValue }: { initialValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialValue);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }

      const nextQuery = params.toString();
      const currentQuery = searchParams.toString();

      if (nextQuery !== currentQuery) {
        startTransition(() => {
          router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
        });
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [pathname, router, searchParams, value]);

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="employee-search" className="sr-only">Cari karyawan</label>
      <input
        id="employee-search"
        name="q"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Cari nama atau email"
        className="w-56 border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
      />
    </div>
  );
}
