"use client";

import { useEffect, useRef, useState } from "react";

export function NavigationProgress() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let activeHref = "";
    let routeWatcher: ReturnType<typeof setInterval> | null = null;
    let isMounted = true;

    function finish() {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (routeWatcher) clearInterval(routeWatcher);
      if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
      progressRef.current = 100;
      setProgress(100);
      finishTimeoutRef.current = setTimeout(() => {
        if (isMounted) {
          setVisible(false);
          setProgress(0);
          progressRef.current = 0;
        }
        finishTimeoutRef.current = null;
      }, 220);
    }

    function start() {
      if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (routeWatcher) clearInterval(routeWatcher);
      activeHref = window.location.href;
      progressRef.current = 8;
      setProgress(8);
      setVisible(true);
      intervalRef.current = setInterval(() => {
        progressRef.current = Math.min(88, progressRef.current + Math.max(1, (88 - progressRef.current) * 0.12));
        setProgress(progressRef.current);
      }, 180);
      routeWatcher = setInterval(() => {
        if (window.location.href !== activeHref) finish();
      }, 100);
      finishTimeoutRef.current = setTimeout(finish, 20000);
    }

    function onDocumentClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;

      const link = event.target.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.hasAttribute("download")) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (`${destination.pathname}${destination.search}${destination.hash}` === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;
      start();
    }

    function onPopState() {
      start();
      finishTimeoutRef.current = setTimeout(finish, 700);
    }

    document.addEventListener("click", onDocumentClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onDocumentClick, true);
      window.removeEventListener("popstate", onPopState);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (routeWatcher) clearInterval(routeWatcher);
      if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
      isMounted = false;
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="navigation-progress-track" role="progressbar" aria-label="Memuat halaman" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
      <span className="navigation-progress-bar" style={{ width: `${progress}%` }} />
    </div>
  );
}