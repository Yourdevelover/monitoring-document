"use client";

export function BulkEmployeeForm() {
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
              <p>Satu karyawan per baris dengan urutan nama,email,password.</p>
              <p className="mt-1">
                Contoh: <code className="font-mono text-[#111111]">naya,aira@gmail.com,rahasia</code>
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
        <form action="/api/manager/employee/create" method="POST" className="mt-5 space-y-4">
          <textarea
            name="employees"
            required
            rows={8}
            placeholder={'naya,aira@gmail.com,rahasia\nBudi,budi@gmail.com,rahasia123'}
            className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-3 font-mono text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
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
