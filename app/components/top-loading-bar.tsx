"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function TopLoadingBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target || link.hasAttribute("download")) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) return;

      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
      barRef.current?.classList.remove("is-complete");
      barRef.current?.classList.add("is-loading");
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar?.classList.contains("is-loading")) return;

    bar.classList.remove("is-loading");
    bar.classList.add("is-complete");
    finishTimerRef.current = setTimeout(() => {
      bar.classList.remove("is-complete");
      finishTimerRef.current = null;
    }, 220);

    return () => {
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, [pathname]);

  return <div ref={barRef} className="top-loading-bar" role="progressbar" aria-label="Memuat halaman" />;
}