'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function AdminUsersToolbar({ searchQuery, statusFilter }: { searchQuery: string | null; statusFilter: string | null }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(searchQuery ?? '');
  const [open, setOpen] = useState(false);
  useEffect(() => setQ(searchQuery ?? ''), [searchQuery]);
  useEffect(() => {
    if (q === (searchQuery ?? '')) return;
    const t = setTimeout(() => {
      const p = new URLSearchParams(sp.toString());
      if (q) p.set('q', q); else p.delete('q');
      p.delete('page');
      router.push(`/dashboard/admin/users?${p.toString()}`);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);
  const onStatus = (v: string) => {
    const p = new URLSearchParams(sp.toString());
    if (v) p.set('status', v); else p.delete('status');
    p.delete('page');
    router.push(`/dashboard/admin/users?${p.toString()}`);
    setOpen(false);
  };
  const statusLabel = statusFilter === 'ACTIVE' ? 'Aktif' : statusFilter === 'INACTIVE' ? 'Nonaktif' : 'Status';
  return (
    <div className="flex items-center gap-2">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau email..." className="h-[30px] min-w-0 flex-1 rounded-md border border-[#e5e7eb] bg-white px-2.5 text-xs text-[#111111] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20" />
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-[30px] items-center justify-between gap-2 rounded-md border border-[#e5e7eb] bg-white px-2.5 text-xs font-medium text-[#111111] hover:bg-[#f8f9fa]"
        >
          <span className="truncate">{statusLabel}</span>
          <span className="shrink-0 text-[#6b7280]">{open ? '▲' : '▼'}</span>
        </button>
        {open && (
          <div className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-md border border-[#e5e7eb] bg-white shadow-lg">
            {[
              { value: '', label: 'Status' },
              { value: 'ACTIVE', label: 'Aktif' },
              { value: 'INACTIVE', label: 'Nonaktif' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onStatus(opt.value)}
                className={`block w-full border-b border-[#f1f3f5] px-3 py-1.5 text-left text-xs last:border-0 hover:bg-[#f8f9fa] ${statusFilter === opt.value ? 'font-medium text-[#2563eb]' : 'text-[#111111]'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <Link href="/dashboard/admin/users/create" className="flex h-[30px] shrink-0 items-center justify-center gap-2 rounded-md bg-[#111111] px-2.5 text-xs font-medium text-white hover:bg-[#1c1c1c]">+ Tambah Admin</Link>
    </div>
  );
}
