"use client";

export function BulkEmployeeForm() {
  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-emerald-700">
        Tambah Karyawan Massal
      </summary>

      <div className="fixed left-1/2 top-1/2 z-20 flex max-h-[calc(100vh-2rem)] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Import cepat</p>
            <div className="mt-2 text-xs text-slate-600">
              <p>Satu karyawan per baris dengan urutan nama,email,password.</p>
              <p className="mt-1">
                Contoh: <code className="font-mono text-slate-900">naya,aira@gmail.com,rahasia</code>
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup tambah karyawan massal"
            onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}
            className="rounded-lg px-2 py-1 text-2xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
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
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-mono text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Simpan Semua Karyawan
          </button>
        </form>
      </div>
    </details>
  );
}
