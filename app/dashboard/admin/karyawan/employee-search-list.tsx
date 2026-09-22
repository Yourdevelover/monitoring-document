'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type EmployeeSearchListProps = {
  employees: Array<{
    id: number;
    name: string;
    email: string;
    phoneNumber: string | null;
    isActive: string;
    createdAt: Date;
    latestLoginAt: Date | null;
    team?: {
      name: string;
      manager?: { id: number; name: string } | null;
      members: Array<{ id: number }>;
    } | null;
  }>;
};

function AdminEmployeeCard({ employee }: { employee: EmployeeSearchListProps["employees"][number] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="grid w-full cursor-pointer gap-3 py-3 text-left transition-colors hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
      >
        <div className="min-w-0">
          <p className="truncate font-semibold">{employee.name}</p>
          <p className="truncate text-sm text-slate-500">{employee.email}</p>
        </div>
        <p className="truncate text-sm text-slate-600">Tim: {employee.team?.name ?? 'Belum memiliki tim'}</p>
        <p className="truncate text-sm text-slate-600">Manajer: {employee.team?.manager?.name ?? 'Belum ditugaskan'}</p>
        <span className="flex items-center gap-2 text-xs text-slate-500">
          <span>{employee.team?.members.length ?? 0} anggota</span>
          <span className="hidden sm:inline">Lihat info</span> →
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4" onClick={() => setIsOpen(false)}>
          <div role="dialog" aria-label={`Informasi ${employee.name}`} className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-sm overflow-y-auto rounded-xl bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <h2 className="break-words text-base font-semibold text-slate-900">{employee.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{employee.email}</p>
            <dl className="mt-4 divide-y divide-slate-100 text-sm">
              {[
                ["Status", employee.isActive],
                ["Nomor telepon", employee.phoneNumber ?? "-"],
                ["Bergabung", new Date(employee.createdAt).toLocaleDateString("id-ID")],
                ["Login terakhir", employee.latestLoginAt ? new Date(employee.latestLoginAt).toLocaleString("id-ID") : "Belum ada data"],
                ["Tim", employee.team?.name ?? "Belum memiliki tim"],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 py-3">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="min-w-0 break-words text-right font-medium text-slate-900">{value}</dd>
                </div>
              ))}
              <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 py-3">
                <dt className="text-slate-500">Manajer</dt>
                <dd className="min-w-0 break-words text-right font-medium">{employee.team?.manager ? <a href={`/dashboard/admin/managers/${employee.team.manager.id}`} className="text-blue-700 hover:underline">{employee.team.manager.name}</a> : "Belum ditugaskan"}</dd>
              </div>
            </dl>
            <a href={`/dashboard/admin/karyawan/${employee.id}`} className="mt-4 block w-full rounded-lg border border-blue-200 px-3 py-2 text-center text-sm font-medium text-blue-700 hover:bg-blue-50">Lihat info lebih lanjut</a>
            <button type="button" onClick={() => setIsOpen(false)} className="mt-2 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">Tutup</button>
          </div>
        </div>
      )}
    </>
  );
}

export function EmployeeSearchList({ employees }: EmployeeSearchListProps) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;

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
        employee.team?.manager?.name ?? '',
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
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <Link
          href="/dashboard/admin/karyawan/create"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Tambah Karyawan
        </Link>
        {filteredEmployees.length > 0 && (
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
        {filteredEmployees.length} hasil cocok
      </p>

      <div className="border-y border-slate-300">
        {filteredEmployees.length > 0 ? (
          visibleEmployees.map((employee) => <AdminEmployeeCard key={employee.id} employee={employee} />)
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">
            Tidak ada karyawan yang cocok dengan kata kunci tersebut.
          </p>
        )}
      </div>
    </>
  );
}
