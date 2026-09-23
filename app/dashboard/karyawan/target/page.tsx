import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/auth";
import { SaveTargetNoteButton } from "./save-target-note-button";

export default async function EmployeeTargetPage() {
  const employee = await requireEmployee();
  const period = new Date().toISOString().slice(0, 7);
  const targets = await prisma.target.findMany({
    where: { userId: employee.id, period },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
          <h1 className="text-[15px] font-semibold tracking-tight">Target {period}</h1>
          <p className="mt-0.5 text-xs text-[#6b7280]">Isi target, lalu update progres. Persen dihitung otomatis.</p>
        </header>

        <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide">Tambah Target</h2>
          <form action="/api/karyawan/target" method="POST" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input type="hidden" name="period" value={period} />
            <input type="hidden" name="action" value="upsert" />
            <input type="hidden" name="formula" value="bagi" />
            <input type="hidden" name="threshold" value="20" />
            <label className="text-xs">Nama<input name="name" required placeholder="Target Bulanan" className="mt-1 w-full rounded-md border border-[#e5e7eb] px-3 py-2 text-sm" /></label>
            <label className="text-xs">Target (100%)<input name="targetValue" required type="number" step="any" placeholder="30000000" className="mt-1 w-full rounded-md border border-[#e5e7eb] px-3 py-2 text-sm" /></label>
            <label className="text-xs">Progres sekarang<input name="currentValue" type="number" step="any" defaultValue={0} placeholder="10000000" className="mt-1 w-full rounded-md border border-[#e5e7eb] px-3 py-2 text-sm" /></label>
            <div className="flex items-end sm:col-span-2 lg:col-span-3"><button type="submit" className="rounded-md bg-[#111111] px-4 py-2 text-sm font-medium text-white hover:bg-[#222]">Simpan</button></div>
          </form>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {targets.length ? targets.map((t) => {
            const pct = t.targetValue > 0 ? (t.currentValue / t.targetValue) * 100 : 0;
            const reached = pct >= 100;
            return (
              <div key={t.id} className="rounded-lg border border-[#e5e7eb] bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-semibold">{t.name}</p>
                  <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${reached ? "bg-[#edf3ec] text-[#346538]" : "bg-[#fbf3db] text-[#956400]"}`}>
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#6b7280]">{t.currentValue.toLocaleString("id-ID")} / {t.targetValue.toLocaleString("id-ID")}</p>
                <div className="mt-2 h-2 rounded bg-[#f1f3f5]">
                  <div className={`h-full rounded ${reached ? "bg-[#346538]" : "bg-[#956400]"}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
                </div>
                {reached && <p className="mt-1.5 text-xs font-medium text-[#346538]">✓ Tercapai 100%</p>}
                <div className="mt-2">
                  <SaveTargetNoteButton name={t.name} current={t.currentValue} target={t.targetValue} pct={pct} />
                </div>
                <div className="mt-3 flex gap-2">
                  <form action="/api/karyawan/target" method="POST" className="flex-1">
                    <input type="hidden" name="action" value="delete" />
                    <input type="hidden" name="id" value={String(t.id)} />
                    <button type="submit" className="w-full rounded-md border border-[#e5e7eb] px-3 py-1.5 text-xs font-medium hover:bg-[#f8f9fa]">Hapus</button>
                  </form>
                  <details className="flex-1">
                    <summary className="cursor-pointer rounded-md border border-[#e5e7eb] px-3 py-1.5 text-center text-xs font-medium hover:bg-[#f8f9fa]">Update Progres</summary>
                    <form action="/api/karyawan/target" method="POST" className="mt-2 space-y-2">
                      <input type="hidden" name="action" value="update" />
                      <input type="hidden" name="id" value={String(t.id)} />
                      <input type="hidden" name="name" value={t.name} />
                      <input type="hidden" name="targetValue" value={String(t.targetValue)} />
                      <input type="hidden" name="formula" value="bagi" />
                      <input type="hidden" name="threshold" value={String(t.threshold)} />
                      <input name="currentValue" type="number" step="any" defaultValue={String(t.currentValue)} required className="w-full rounded-md border border-[#e5e7eb] px-2 py-1.5 text-xs" placeholder="Progres baru" />
                      <button type="submit" className="w-full rounded-md bg-[#111111] px-3 py-1.5 text-xs font-medium text-white">Simpan Progres</button>
                    </form>
                  </details>
                </div>
              </div>
            );
          }) : <p className="col-span-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-6 text-center text-xs text-[#6b7280]">Belum ada target bulan ini.</p>}
        </section>
      </div>
    </main>
  );
}
