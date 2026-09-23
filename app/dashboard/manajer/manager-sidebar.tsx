"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type ManagerSidebarProps = {
  navItems: Array<{ href: string; label: string }>;
};

export function ManagerSidebar({ navItems }: ManagerSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  return (
    <aside className={`${isOpen ? "w-60" : "w-14"} shrink-0 border-r border-[#e5e7eb] bg-[#111111] text-[#9ca3af] transition-[width] duration-200`}>
      <div className="flex items-center justify-between border-b border-[#2a2a2a] px-3 py-3">
        {isOpen && <span className="text-xs font-semibold uppercase tracking-[0.08em] text-white">Panel Manajer</span>}
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? "Tutup sidebar" : "Buka sidebar"}
          className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-[#9ca3af] transition hover:bg-[#1c1c1c] hover:text-white"
        >
          {isOpen ? "‹" : "›"}
        </button>
      </div>

      {isOpen && (
        <>
          <nav className="space-y-0.5 px-2 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                  pathname === item.href
                    ? "bg-[#222222] text-white"
                    : "text-[#9ca3af] hover:bg-[#1c1c1c] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form action="/api/logout" method="POST" className="px-2 pt-2">
            <button
              type="submit"
              className="w-full rounded-md border border-[#2a2a2a] bg-[#1c1c1c] px-3 py-2 text-sm font-medium text-[#9ca3af] transition hover:border-[#444] hover:bg-[#222222] hover:text-white active:scale-[0.98]"
            >
              Keluar
            </button>
          </form>
        </>
      )}
    </aside>
  );
}
