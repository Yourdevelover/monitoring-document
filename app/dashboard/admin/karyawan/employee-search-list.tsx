'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ConfirmActionForm } from '@/app/components/confirm-action-form';

type EmployeeSearchListProps = {
  employees: Array<{
    id: number;
    name: string;
    email: string;
    nik: string | null;
    phoneNumber: string | null;
    isActive: string;
    createdAt: Date;
    latestLoginAt: Date | null;
    team?: {
      name: string;
      department: string;
      leader?: { id: number; name: string } | null;
      members: Array<{ id: number }>;
    } | null;
  }>;
};

function AdminEmployeeCard({ employee }: { employee: EmployeeSearchListProps["employees"][number] }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="grid w-full cursor-pointer gap-2 px-3 py-2.5 text-left transition-colors hover:bg-[#f8f9fa] sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
      >
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium">{employee.name}</p>
          <p className="truncate text-xs text-[#6b7280]">{employee.email}</p>
        </div>
        <p className="truncate text-xs text-[#6b7280]">{employee.team ? `${employee.team.department} · ${employee.team.name}` : "Belum memiliki tim"}</p>
        <p className="truncate text-xs text-[#6b7280]">Leader: {employee.team?.leader?.name ?? 'Belum ditugaskan'}</p>
        <span className="flex items-center gap-2 text-[11px] text-[#6b7280]">
          <span>{employee.team?.members.length ?? 0} anggota</span>
          <span className="hidden sm:inline">Lihat info</span> →
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-[#111111]/50 p-4" onClick={() => setIsOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label={`Informasi ${employee.name}`} className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-sm overflow-y-auto rounded-lg border border-[#e1e5e9] bg-white shadow-xl" onClick={(event) => event.stopPropagation()}>
            <header className="flex items-start justify-between gap-3 px-4 py-4">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">Detail Karyawan</p>
                <h2 className="mt-1 break-words text-sm font-semibold text-[#111111]">{employee.name}</h2>
                <p className="mt-0.5 break-all text-xs text-[#6b7280]">{employee.email}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${employee.isActive === 'ACTIVE' ? 'bg-[#edf3ec] text-[#346538]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>
                {employee.isActive === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
              </span>
            </header>
            <section className="border-y border-[#e9ecef] bg-[#f7f9fa] px-4 py-3">
              <h3 className="mb-2 text-xs font-semibold text-[#111111]">Aktivitas Akun Terakhir</h3>
              <div className="border-l-2 border-[#5c8f68] pl-3">
                <p className="text-[11px] text-[#6b7280]">Login terakhir</p>
                <p className="mt-1 text-xs font-medium text-[#111111]">{employee.latestLoginAt ? new Date(employee.latestLoginAt).toLocaleString('id-ID') : 'Belum ada data'}</p>
              </div>
            </section>
            <div className="px-4 py-3">
              <h3 className="mb-1 text-xs font-semibold text-[#111111]">Rincian Profil</h3>
              <dl className="divide-y divide-[#f1f3f5] text-xs">
              {[
                ["NIK", employee.nik ?? "Belum diisi"],
                ["Nomor telepon", employee.phoneNumber ?? "-"],
                ["Bergabung", new Date(employee.createdAt).toLocaleDateString("id-ID")],
                ["Tim", employee.team?.name ?? "Belum memiliki tim"],
                ["Departemen", employee.team?.department ?? "Belum ditentukan"],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 py-2.5">
                  <dt className="text-[#6b7280]">{label}</dt>
                  <dd className="min-w-0 break-words text-left font-medium text-[#111111]">{value}</dd>
                </div>
              ))}
              <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 py-2.5">
                <dt className="text-[#6b7280]">Leader</dt>
                <dd className="min-w-0 break-words text-left font-medium">{employee.team?.leader ? <a href={`/dashboard/admin/leaders/${employee.team.leader.id}`} className="text-[#1f6c9f] hover:underline">{employee.team.leader.name}</a> : "Belum ditugaskan"}</dd>
              </div>
            </dl>
            </div>
            <div className="border-t border-[#e9ecef] px-4 py-3">
            <Link href={`/dashboard/admin/karyawan/${employee.id}`} onClick={() => setIsOpen(false)} className="block w-full rounded-md border border-[#e1f3fe] px-3 py-2 text-center text-xs font-medium text-[#1f6c9f] hover:bg-[#e1f3fe]">Lihat info lebih lanjut</Link>
            <ConfirmActionForm
              action="/api/admin/karyawan/action"
              confirmMessage={`Yakin ingin ${employee.isActive === "ACTIVE" ? "menonaktifkan" : "mengaktifkan"} akun ${employee.name}?`}
            >
              <input type="hidden" name="userId" value={employee.id} />
              <input type="hidden" name="action" value={employee.isActive === "ACTIVE" ? "deactivate" : "activate"} />
              <button type="submit" className={`mt-2 inline-flex h-8 w-full items-center justify-center rounded-md px-3 text-xs font-medium ${employee.isActive === "ACTIVE" ? "border border-[#e5e7eb] text-[#374151] hover:bg-[#f8f9fa]" : "bg-[#346538] text-white hover:bg-[#2d5a30]"}`}>
                {employee.isActive === "ACTIVE" ? "Nonaktifkan Akun" : "Aktifkan Akun"}
              </button>
            </ConfirmActionForm>
            <button type="button" onClick={() => setIsOpen(false)} className="mt-2 w-full rounded-md bg-[#111111] px-3 py-2 text-xs font-medium text-white hover:bg-[#333333]">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function EmployeeSearchList({ employees }: EmployeeSearchListProps) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return employees;
    }

    return employees.filter((employee) => {
      const searchableText = [
        employee.name,
        employee.email,
        employee.team?.name ?? '',
        employee.team?.department ?? '',
        employee.team?.leader?.name ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [employees, query]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const visibleEmployees = filteredEmployees.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:gap-3">
        <div className="w-full flex-1">
          <input
            id="employee-search"
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Ketik nama atau email karyawan..."
            className="h-8 w-full rounded-md border border-[#e5e7eb] bg-white px-3 text-xs text-[#111111] outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
          />
        </div>

        <Link
          href="/dashboard/admin/karyawan/create"
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-md bg-[#111111] px-3 text-xs font-medium text-white transition hover:bg-[#1c1c1c]"
        >
          Tambah Karyawan
        </Link>
        {filteredEmployees.length > 0 && (
          <div className="flex shrink-0 items-center gap-2 text-xs">
            <button type="button" aria-label="Halaman sebelumnya" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#e5e7eb] text-xs disabled:cursor-not-allowed disabled:opacity-40">‹</button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button key={pageNumber} type="button" aria-current={pageNumber === page ? 'page' : undefined} onClick={() => setPage(pageNumber)} className={pageNumber === page ? 'inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#111111] bg-[#111111] text-xs text-white' : 'inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#e5e7eb] text-xs hover:bg-[#f8f9fa]'}>{pageNumber}</button>
            ))}
            <button type="button" aria-label="Halaman berikutnya" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#e5e7eb] text-xs disabled:cursor-not-allowed disabled:opacity-40">›</button>
          </div>
        )}
      </div>

      <div className="border-y border-[#e5e7eb]">
        {filteredEmployees.length > 0 ? (
          visibleEmployees.map((employee) => <AdminEmployeeCard key={employee.id} employee={employee} />)
        ) : (
          <p className="py-8 text-center text-sm text-[#6b7280]">
            Tidak ada karyawan yang cocok dengan kata kunci tersebut.
          </p>
        )}
      </div>
    </>
  );
}
