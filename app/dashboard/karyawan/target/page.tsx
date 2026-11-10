import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/auth";
import { SaveTargetNoteButton } from "@/app/components/save-target-note-button";
import { TargetVisibilityToggle } from "./target-visibility-toggle";

export default async function EmployeeTargetPage() {
  const employee = await requireEmployee();
  const now = new Date();
  const periodParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const period = `${periodParts.find((part) => part.type === "year")?.value}-${periodParts.find((part) => part.type === "month")?.value}`;
  const todayLabel = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(now);
  const targets = await prisma.target.findMany({
    where: { userId: employee.id, period },
    orderBy: { createdAt: "desc" },
  });
  const teamTargets = employee.teamId
    ? await prisma.target.findMany({
        where: {
          period,
          isPublic: true,
          userId: { not: employee.id },
          user: { teamId: employee.teamId, role: "KARYAWAN" },
        },
        include: { user: { select: { name: true } } },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      })
    : [];

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
          <div className="flex items-baseline gap-2 whitespace-nowrap">
            <h1 className="text-[15px] font-bold tracking-tight">{todayLabel}</h1>
          </div>
          <div className="mt-2 space-y-0.5 text-xs text-[#6b7280]">
            <p>Bagikan progres ke tim dengan mengaktifkan visibilitas.</p>
            <p>Target Anda ditampilkan lebih dulu,</p>
            <p>lalu diikuti target karyawan lain yang dibagikan ke tim.</p>
          </div>
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
            <label className="flex min-h-10 items-center justify-between gap-3 rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-xs sm:col-span-2 lg:col-span-3">
              <input type="hidden" name="isPublic" value="false" />
              <span>
                <span className="block font-medium text-[#111111]">Bagikan target ke tim</span>
                <span className="mt-0.5 block text-[#6b7280]">Saat aktif, semua karyawan di tim dapat melihat progres ini.</span>
              </span>
              <input
                type="checkbox"
                name="isPublic"
                value="true"
                role="switch"
                defaultChecked
                className="peer sr-only"
                aria-label="Bagikan target ke semua karyawan di tim"
              />
              <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-[#d1d5db] transition peer-checked:bg-[#346538] after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#2563eb]" />
            </label>
            <div className="flex items-end sm:col-span-2 lg:col-span-3"><button type="submit" className="rounded-md bg-[#111111] px-4 py-2 text-sm font-medium text-white hover:bg-[#222]">Simpan</button></div>
          </form>
        </section>

        <section>
          <p className="mb-3 text-xs text-[#6b7280]">
            Target Anda ditampilkan lebih dulu, lalu diikuti target karyawan lain yang dibagikan ke tim.
          </p>
          <div className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                <div className="mt-3">
                  <TargetVisibilityToggle targetId={t.id} isPublic={t.isPublic} />
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
          }) : null}
            {teamTargets.length ? teamTargets.map((target) => {
              const pct = target.targetValue > 0 ? (target.currentValue / target.targetValue) * 100 : 0;
              const reached = pct >= 100;
              return (
                <article key={target.id} className="rounded-lg border border-[#e5e7eb] bg-white p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-medium text-[#6b7280]">{target.user.name}</p>
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium ${reached ? "bg-[#edf3ec] text-[#346538]" : "bg-[#fbf3db] text-[#956400]"}`}>{pct.toFixed(1)}%</span>
                  </div>
                  <p className="mt-2 truncate text-[13px] font-semibold">{target.name}</p>
                  <p className="mt-1 text-xs text-[#6b7280]">{target.currentValue.toLocaleString("id-ID")} / {target.targetValue.toLocaleString("id-ID")}</p>
                  <div className="mt-2 h-2 rounded bg-[#f1f3f5]">
                    <div className={`h-full rounded ${reached ? "bg-[#346538]" : "bg-[#956400]"}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
                  </div>
                </article>
              );
            }) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
