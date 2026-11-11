"use client";

import { useState } from "react";
import { animateShuffleArrows } from "@/app/components/generated-password-input";

export function BulkEmployeeForm() {
  const [employees, setEmployees] = useState("");
  const [shuffleIcon, setShuffleIcon] = useState<SVGSVGElement | null>(null);

  function randomPassword() {
    const upperBound = Math.floor(0x1_0000_0000 / 1_000_000) * 1_000_000;
    const value = new Uint32Array(1);
    do {
      crypto.getRandomValues(value);
    } while (value[0] >= upperBound);
    return String(value[0] % 1_000_000).padStart(6, "0");
  }

  function randomizePasswords() {
    const rows = employees.split(/\r?\n/).map((row) => row.trim()).filter(Boolean);
    setEmployees(rows.map((row) => {
      const delimiter = row.includes(",") ? "," : "|";
      const fields = row.split(delimiter).map((field) => field.trim());
      if (fields.length < 3) return row;
      return [...fields.slice(0, 3), randomPassword()].join(delimiter);
    }).join("\n"));
    animateShuffleArrows(shuffleIcon);
  }

  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-lg bg-[#346538] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#2d5a30]">
        Tambah Karyawan Massal
      </summary>

      <div className="fixed left-1/2 top-1/2 z-20 flex max-h-[calc(100vh-2rem)] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="flex items-start justify-between gap-4 border-b border-[#e5e7eb] pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#346538]">Import cepat</p>
            <div className="mt-2 text-xs text-[#6b7280]">
              <p>Satu karyawan per baris dengan urutan nama,email,jabatan,password (6 angka).</p>
              <p className="mt-1">
                Contoh: <code className="font-mono text-[#111111]">Naya,naya@example.com,Analis,123456</code>
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup tambah karyawan massal"
            onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}
            className="rounded-lg px-2 py-1 text-lg leading-none text-[#6b7280] hover:bg-[#f8f9fa] hover:text-[#111111]"
          >
            ×
          </button>
        </div>
        <form action="/api/leader/employee/create" method="POST" className="mt-5 space-y-4">
          <textarea
            name="employees"
            required
            rows={8}
            value={employees}
            onChange={(event) => setEmployees(event.target.value)}
            placeholder={'Naya,naya@example.com,Analis,123456\nBudi,budi@example.com,Staf,654321'}
            className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-3 font-mono text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={randomizePasswords}
              aria-label="Acak password semua karyawan"
              title="Acak password semua karyawan"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] bg-white hover:bg-[#f8f9fa]"
            >
              <svg ref={setShuffleIcon} aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5 transition-transform duration-500 ease-in-out" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h2c5 0 7 10 12 10h4m-3-3 3 3-3 3"/><path d="M3 17h2c2 0 3.5-2 4.5-4.5m3-5C14 7.5 15 7 17 7h4m-3-3 3 3-3 3"/></svg>
                <svg ref={setShuffleIcon} aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5 transition-transform duration-500 ease-in-out" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 13a7 7 0 00-7-7H8m4-4L8 6l4 4"/><path d="M5 11a7 7 0 007 7h4m-4-4 4 4-4 4"/></svg>
            </button>
            <span className="text-xs text-[#374151]">Acak password semua baris</span>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-[#346538] px-4 py-2.5 font-semibold text-white transition-colors hover:bg-[#2d5a30]"
          >
            Simpan Semua Karyawan
          </button>
        </form>
      </div>
    </details>
  );
}
