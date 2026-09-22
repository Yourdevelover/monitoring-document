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
    <aside className={`${isOpen ? "w-56" : "w-14"} shrink-0 bg-slate-900 text-slate-100 transition-[width] duration-200`}>
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-3">
        {isOpen && <span className="text-sm font-semibold">Panel Manajer</span>}
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? "Tutup sidebar" : "Buka sidebar"}
          className="flex h-8 w-8 items-center justify-center text-lg text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          {isOpen ? "‹" : "›"}
        </button>
      </div>

      {isOpen && (
        <>
          <nav className="space-y-1 px-2 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block border-l-2 px-3 py-2 text-sm font-medium transition ${
                  pathname === item.href
                    ? "border-slate-300 bg-slate-800 text-white"
                    : "border-transparent text-slate-200 hover:border-slate-500 hover:bg-slate-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form action="/api/logout" method="POST" className="px-2 pt-2">
            <button
              type="submit"
              className="w-full border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700"
            >
              Keluar
            </button>
          </form>
        </>
      )}
    </aside>
  );
}
