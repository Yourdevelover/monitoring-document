'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type ManagerSearchListProps = {
  managers: Array<{
    id: number;
    name: string;
    email: string;
    phoneNumber: string | null;
    isActive: string;
    createdAt: Date;
    latestLoginAt: Date | null;
    managedTeam?: {
      name: string | null;
      members: Array<{ id: number }>;
    } | null;
  }>;
};

function AdminManagerCard({ manager }: { manager: ManagerSearchListProps["managers"][number] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="grid w-full cursor-pointer gap-3 py-3 text-left transition-colors hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
      >
        <div className="min-w-0">
          <p className="truncate font-semibold">{manager.name}</p>
          <p className="truncate text-sm text-slate-500">{manager.email}</p>
        </div>
        <p className="truncate text-sm text-slate-600">Tim: {manager.managedTeam?.name ?? 'Belum memiliki tim'}</p>
        <span className="flex items-center gap-2 text-xs text-slate-500">
          <span>{manager.managedTeam?.members.length ?? 0} anggota</span>
          <span className="hidden sm:inline">Lihat info</span> →
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4" onClick={() => setIsOpen(false)}>
          <div role="dialog" aria-label={`Informasi ${manager.name}`} className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-sm overflow-y-auto rounded-xl bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <h2 className="break-words text-base font-semibold text-slate-900">{manager.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{manager.email}</p>
            <dl className="mt-4 divide-y divide-slate-100 text-sm">
              {[
                ["Status", manager.isActive],
                ["Nomor telepon", manager.phoneNumber ?? "-"],
                ["Bergabung", new Date(manager.createdAt).toLocaleDateString("id-ID")],
                ["Login terakhir", manager.latestLoginAt ? new Date(manager.latestLoginAt).toLocaleString("id-ID") : "Belum ada data"],
                ["Tim", manager.managedTeam?.name ?? "Belum memiliki tim"],
                ["ID Manajer", String(manager.id)],
                ["Jumlah anggota tim", String(manager.managedTeam?.members.length ?? 0)],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 py-3">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="min-w-0 break-words text-right font-medium text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
            <a href={`/dashboard/admin/managers/${manager.id}`} className="mt-4 block w-full rounded-lg border border-blue-200 px-3 py-2 text-center text-sm font-medium text-blue-700 hover:bg-blue-50">Lihat info lebih lanjut</a>
            <button type="button" onClick={() => setIsOpen(false)} className="mt-2 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">Tutup</button>
          </div>
        </div>
      )}
    </>
  );
}

export function ManagerSearchList({ managers }: ManagerSearchListProps) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filteredManagers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return managers;
    }

    return managers.filter((manager) => {
      const searchableText = [
        manager.name,
        manager.email,
        manager.managedTeam?.name ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [managers, query]);

  const totalPages = Math.max(1, Math.ceil(filteredManagers.length / pageSize));
  const visibleManagers = filteredManagers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:gap-3">
        <div className="w-full flex-1">
          <input
            id="manager-search"
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Ketik nama atau email manajer..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <Link
          href="/dashboard/admin/managers/create"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Tambah Manajer
        </Link>
        {filteredManagers.length > 0 && (
          <div className="flex shrink-0 items-center gap-2 text-sm">
            <span className="text-slate-500">6 data per halaman</span>
            <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="border border-slate-300 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40">‹</button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button key={pageNumber} type="button" aria-current={pageNumber === page ? 'page' : undefined} onClick={() => setPage(pageNumber)} className={pageNumber === page ? 'border border-slate-900 bg-slate-900 px-2 py-1 text-white' : 'border border-slate-300 px-2 py-1 hover:bg-slate-50'}>{pageNumber}</button>
            ))}
            <button type="button" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} className="border border-slate-300 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40">›</button>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500">
        {filteredManagers.length} hasil cocok
      </p>

      <div className="border-y border-slate-300">
        {filteredManagers.length > 0 ? (
          visibleManagers.map((manager) => <AdminManagerCard key={manager.id} manager={manager} />)
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">
            Tidak ada manajer yang cocok dengan kata kunci tersebut.
          </p>
        )}
      </div>
    </>
  );
}
