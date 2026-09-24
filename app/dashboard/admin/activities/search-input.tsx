"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function SearchInput({
  initialQuery,
  date,
  action,
}: {
  initialQuery: string | null;
  date: string | null;
  action: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery ?? "");
  const first = useRef(true);

  useEffect(() => {
    setValue(initialQuery ?? "");
  }, [initialQuery]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      const sp = new URLSearchParams();
      if (date) sp.set("date", date);
      if (action) sp.set("action", action);
      if (value.trim()) sp.set("q", value.trim());
      router.push(`/dashboard/admin/activities?${sp.toString()}`);
    }, 300);
    return () => clearTimeout(t);
  }, [value, date, action, router]);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Cari..."
      className="h-[30px] min-w-0 flex-1 rounded-md border border-[#e5e7eb] bg-white px-2 text-xs outline-none focus:border-[#2563eb]"
    />
  );
}
