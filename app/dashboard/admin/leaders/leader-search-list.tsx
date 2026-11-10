'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type LeaderSearchListProps = {
  leaders: Array<{
    id: number;
    name: string;
    email: string;
    phoneNumber: string | null;
    isActive: string;
    createdAt: Date;
    latestLoginAt: Date | null;
    ledTeam?: {
      name: string | null;
      department: string;
      members: Array<{ id: number }>;
    } | null;
  }>;
};

function AdminLeaderCard({ leader }: { leader: LeaderSearchListProps["leaders"][number] }) {
  const [isOpen, setIsOpen] = useState(false);
  const statusLabel = leader.isActive === "PENDING"
    ? "Menunggu persetujuan"
    : leader.isActive === "REJECTED"
      ? "Ditolak"
      : leader.isActive === "ACTIVE" ? "Aktif" : "Nonaktif";
  const statusClass = leader.isActive === "PENDING"
    ? "bg-amber-50 text-amber-800"
    : leader.isActive === "ACTIVE" ? "bg-[#edf3ec] text-[#346538]" : "bg-[#fdebec] text-[#9f2f2d]";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="grid w-full cursor-pointer gap-2 px-3 py-2.5 text-left transition-colors hover:bg-[#f8f9fa] sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
      >
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium">{leader.name}</p>
          <p className="truncate text-xs text-[#6b7280]">{leader.email}</p>
          <span className={`mt-1 inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${statusClass}`}>{statusLabel}</span>
        </div>
        <p className="truncate text-xs text-[#6b7280]">{leader.ledTeam ? `${leader.ledTeam.department} · ${leader.ledTeam.name}` : "Belum memiliki tim"}</p>
        <span className="flex items-center gap-2 text-[11px] text-[#6b7280]">
          <span>{leader.ledTeam?.members.length ?? 0} anggota</span>
          <span className="hidden sm:inline">Lihat info</span> →
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-[#111111]/50 p-4" onClick={() => setIsOpen(false)}>
          <div role="dialog" aria-label={`Informasi ${leader.name}`} className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-sm overflow-y-auto rounded-lg border border-[#e5e7eb] bg-white p-4" onClick={(event) => event.stopPropagation()}>
            <h2 className="break-words text-[13px] font-semibold text-[#111111]">{leader.name}</h2>
            <p className="mt-1 text-xs text-[#6b7280]">{leader.email}</p>
            <dl className="mt-4 divide-y divide-slate-100 text-xs">
              {[
                ["Status", statusLabel],
                ["Nomor telepon", leader.phoneNumber ?? "-"],
                ["Bergabung", new Date(leader.createdAt).toLocaleDateString("id-ID")],
                ["Login terakhir", leader.latestLoginAt ? new Date(leader.latestLoginAt).toLocaleString("id-ID") : "Belum ada data"],
                ["Tim", leader.ledTeam?.name ?? "Belum memiliki tim"],
                ["Departemen", leader.ledTeam?.department ?? "Belum ditentukan"],
                ["ID Leader", String(leader.id)],
                ["Jumlah anggota tim", String(leader.ledTeam?.members.length ?? 0)],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 py-3">
                  <dt className="text-[#6b7280]">{label}</dt>
                  <dd className="min-w-0 break-words text-right font-medium text-[#111111]">{value}</dd>
                </div>
              ))}
            </dl>
            <a href={`/dashboard/admin/leaders/${leader.id}`} className="mt-4 block w-full rounded-md border border-[#e1f3fe] px-3 py-2 text-center text-xs font-medium text-[#1f6c9f] hover:bg-[#e1f3fe]">Lihat info lebih lanjut</a>
            <button type="button" onClick={() => setIsOpen(false)} className="mt-2 w-full rounded-md bg-[#111111] px-3 py-2 text-xs font-medium text-white hover:bg-[#333333]">Tutup</button>
          </div>
        </div>
      )}
    </>
  );
}

export function LeaderSearchList({ leaders }: LeaderSearchListProps) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filteredLeaders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return leaders;
    }

    return leaders.filter((leader) => {
      const searchableText = [
        leader.name,
        leader.email,
        leader.ledTeam?.name ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [leaders, query]);

  const totalPages = Math.max(1, Math.ceil(filteredLeaders.length / pageSize));
  const visibleLeaders = filteredLeaders.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:gap-3">
        <div className="w-full flex-1">
          <input
            id="leader-search"
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Ketik nama atau email leader..."
            className="w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-xs text-[#111111] outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
          />
        </div>

        <Link
          href="/dashboard/admin/leaders/create"
          className="inline-flex shrink-0 items-center justify-center rounded-md bg-[#111111] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#1c1c1c]"
        >
          Tambah Leader
        </Link>
        {filteredLeaders.length > 0 && (
          <div className="flex shrink-0 items-center gap-2 text-xs">
            <span className="text-[#6b7280]">6 data per halaman</span>
            <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="border border-[#e5e7eb] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40">‹</button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button key={pageNumber} type="button" aria-current={pageNumber === page ? 'page' : undefined} onClick={() => setPage(pageNumber)} className={pageNumber === page ? 'border border-[#111111] bg-[#111111] px-2 py-1 text-white' : 'border border-[#e5e7eb] px-2 py-1 hover:bg-[#f8f9fa]'}>{pageNumber}</button>
            ))}
            <button type="button" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} className="border border-[#e5e7eb] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40">›</button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-[#6b7280]">
        {filteredLeaders.length} hasil cocok
      </p>

      <div className="border-y border-[#e5e7eb]">
        {filteredLeaders.length > 0 ? (
          visibleLeaders.map((leader) => <AdminLeaderCard key={leader.id} leader={leader} />)
        ) : (
          <p className="py-8 text-center text-sm text-[#6b7280]">
            Tidak ada leader yang cocok dengan kata kunci tersebut.
          </p>
        )}
      </div>
    </>
  );
}
