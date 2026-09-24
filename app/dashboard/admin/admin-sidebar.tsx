"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/app/components/logo";
import { getNavIcon, IconLogout } from "@/app/components/sidebar-icons";

type AdminSidebarProps = {
  navItems: Array<{ href: string; label: string }>;
};

export function AdminSidebar({ navItems }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  return (
    <aside className={`relative ${isOpen ? "w-56" : "w-14"} shrink-0 bg-[#18181b] text-[#d4d4d8] transition-[width] duration-200`}>
      <div className="border-b border-[#27272a] px-3 py-4">
        <div className="flex items-center justify-between">
          {isOpen ? (
            <Logo className="h-7 w-auto" />
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-label={isOpen ? "Tutup sidebar" : "Buka sidebar"}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#27272a] bg-[#1f1f23] text-xs text-[#fafafa] shadow-sm transition hover:bg-[#27272a] active:scale-95"
          >
            {isOpen ? "‹" : "›"}
          </button>
        </div>
        {isOpen && (
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white">
            Panel Administrasi
          </p>
        )}
      </div>

      {isOpen ? (
        <nav className="space-y-0.5 px-2 py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-[13px] font-medium transition ${
                pathname === item.href
                  ? "bg-[#27272a] text-[#fafafa]"
                  : "text-[#d4d4d8] hover:bg-[#1f1f23] hover:text-[#fafafa]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : (
        <nav className="flex flex-col items-center gap-1 px-2 py-3">
          {navItems.map((item) => {
            const Icon = getNavIcon(item.label);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
                  pathname === item.href
                    ? "bg-[#27272a] text-[#fafafa]"
                    : "text-[#d4d4d8] hover:bg-[#1f1f23] hover:text-[#fafafa]"
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
              </Link>
            );
          })}
        </nav>
      )}

      {isOpen ? (
        <form action="/api/logout" method="POST" className="px-2 pt-2">
          <button
            type="submit"
            className="flex w-full items-center justify-between rounded-md border border-[#27272a] bg-[#1f1f23] px-3 py-2 text-[13px] font-medium text-[#d4d4d8] transition hover:border-[#3f3f46] hover:bg-[#27272a] hover:text-[#fafafa] active:scale-[0.98]"
          >
            <span>Keluar</span>
            <IconLogout className="h-4 w-4 shrink-0" />
          </button>
        </form>
      ) : (
        <form action="/api/logout" method="POST" className="flex justify-center px-2 pt-2">
          <button
            type="submit"
            title="Keluar"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#27272a] bg-[#1f1f23] text-[#d4d4d8] transition hover:border-[#3f3f46] hover:bg-[#27272a] hover:text-[#fafafa] active:scale-[0.98]"
          >
            <IconLogout className="h-4 w-4" />
          </button>
        </form>
      )}
    </aside>
  );
}
