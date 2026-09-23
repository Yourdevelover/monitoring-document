"use client";

import { useState, useRef, useEffect } from "react";

type SharedFile = {
  id: number;
  title: string;
  fileName: string;
  category: string;
  filePath: string;
  uploaderName: string;
};

export function ManagerFilePopover({ file }: { file: SharedFile }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center justify-center rounded-lg bg-[#111111] px-2.5 py-1 text-xs font-medium text-white transition hover:bg-[#333333]"
      >
        Lihat
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-lg border border-[#e5e7eb] bg-white p-4">
          <p className="text-sm font-semibold text-[#111111]">{file.title}</p>
          <p className="mt-1 break-all text-xs text-[#6b7280]">{file.fileName}</p>
          <p className="mt-2 text-xs text-[#6b7280]">
            Kategori: {file.category} • oleh {file.uploaderName}
          </p>
          <div className="mt-3 flex gap-2">
            <a
              href={file.filePath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#111111] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#333333]"
            >
              Lihat file
            </a>
            <a
              href={file.filePath}
              download
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#111111] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#333333]"
            >
              Unduh
            </a>
          </div>
        </div>
      )}
    </div>
  );
}