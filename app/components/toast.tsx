"use client";

import { useCallback, useEffect, useState } from "react";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; message: string; kind: ToastKind };

let nextId = 1;

export function toast(message: string, kind: ToastKind = "success") {
  window.dispatchEvent(new CustomEvent("app-toast", { detail: { message, kind } }));
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, kind: ToastKind) => {
    const id = nextId++;
    setItems((prev) => [...prev, { id, message, kind }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail as { message: string; kind: ToastKind };
      if (d?.message) push(d.message, d.kind ?? "success");
    };
    window.addEventListener("app-toast", handler);
    const q = new URLSearchParams(window.location.search).get("toast");
    let initialToastTimer: number | undefined;
    if (q) {
      initialToastTimer = window.setTimeout(() => push(q, "success"), 0);
      const url = new URL(window.location.href);
      url.searchParams.delete("toast");
      window.history.replaceState(null, "", url.toString());
    }
    return () => {
      if (initialToastTimer !== undefined) window.clearTimeout(initialToastTimer);
      window.removeEventListener("app-toast", handler);
    };
  }, [push]);

  if (!items.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={`rounded-md border px-3 py-2 text-sm shadow-lg ${
            t.kind === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : t.kind === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-[#e5e7eb] bg-white text-[#111111]"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
