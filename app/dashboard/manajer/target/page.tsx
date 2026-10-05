import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/auth";
import { SaveTargetNoteButton } from "@/app/components/save-target-note-button";
import { PersonalTargetDialog } from "./personal-target-dialog";

export default async function ManagerTargetPage() {
  const manager = await requireManager();
  const team = await prisma.team.findUnique({
    where: { managerId: manager.id },
    include: { members: { where: { role: "KARYAWAN" }, select: { id: true, name: true } } },
  });
  const period = new Date().toISOString().slice(0, 7);
  const [targets, personalTargets] = await Promise.all([
    prisma.target.findMany({
      where: { period, user: { teamId: team?.id, role: "KARYAWAN" } },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.target.findMany({
      where: { userId: manager.id, period },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight">Target {period}</h1>
              <p className="mt-0.5 text-xs text-[#6b7280]">Pantau target seluruh anggota tim.</p>
            </div>
          </div>
        </header>

        <div className="flex justify-start">
          <PersonalTargetDialog period={period} />
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Target Anggota Tim</h2>
        <section className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {personalTargets.map((target) => {
            const pct = target.targetValue > 0 ? (target.currentValue / target.targetValue) * 100 : 0;
            const reached = pct >= 100;
            return (
              <article key={`manager-${target.id}`} className="rounded-lg border border-[#e5e7eb] bg-white p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="truncate text-[13px] font-semibold">{manager.name}</p>
                  <span className="shrink-0 rounded bg-[#e1f3fe] px-1.5 py-0.5 text-[10px] font-semibold text-[#1f6c9f]">Target Saya</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-medium text-[#374151]">{target.name}</p>
                  <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${reached ? "bg-[#edf3ec] text-[#346538]" : "bg-[#fbf3db] text-[#956400]"}`}>{pct.toFixed(1)}%</span>
                </div>
                <p className="mt-1 text-xs text-[#6b7280]">{target.currentValue.toLocaleString("id-ID")} / {target.targetValue.toLocaleString("id-ID")}</p>
                <div className="mt-2 h-2 rounded bg-[#f1f3f5]"><div className={`h-full rounded ${reached ? "bg-[#346538]" : "bg-[#956400]"}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} /></div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <SaveTargetNoteButton name={target.name} current={target.currentValue} target={target.targetValue} pct={pct} />
                  <form action="/api/manajer/target" method="POST" className="flex items-center gap-1.5">
                    <input type="hidden" name="action" value="update" />
                    <input type="hidden" name="id" value={target.id} />
                    <label className="sr-only" htmlFor={`manager-target-progress-${target.id}`}>Progres target {target.name}</label>
                    <input id={`manager-target-progress-${target.id}`} name="currentValue" type="number" min="0" step="any" defaultValue={String(target.currentValue)} className="w-24 rounded border border-[#d1d5db] bg-white px-2 py-1 text-xs" />
                    <button type="submit" className="rounded bg-white px-2 py-1 text-xs font-medium text-[#374151] ring-1 ring-[#d1d5db] hover:bg-[#f1f3f5]">Update</button>
                  </form>
                  <form action="/api/manajer/target" method="POST">
                    <input type="hidden" name="action" value="delete" />
                    <input type="hidden" name="id" value={target.id} />
                    <button type="submit" className="text-xs font-medium text-[#9f2f2d] hover:underline">Hapus</button>
                  </form>
                </div>
              </article>
            );
          })}
          {targets.length ? targets.map((t) => {
            const pct = t.targetValue > 0 ? (t.currentValue / t.targetValue) * 100 : 0;
            const reached = pct >= 100;
            return (
              <div key={t.id} className="h-fit rounded-lg border border-[#e5e7eb] bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-semibold">{t.user.name}</p>
                  <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${reached ? "bg-[#edf3ec] text-[#346538]" : "bg-[#fbf3db] text-[#956400]"}`}>
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#6b7280]">{t.name}: {t.currentValue.toLocaleString("id-ID")} / {t.targetValue.toLocaleString("id-ID")}</p>
                <div className="mt-2 h-2 rounded bg-[#f1f3f5]">
                  <div className={`h-full rounded ${reached ? "bg-[#346538]" : "bg-[#956400]"}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
                </div>
              </div>
            );
          }) : personalTargets.length === 0 ? <p className="col-span-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-6 text-center text-xs text-[#6b7280]">Belum ada target bulan ini.</p> : null}
        </section>
        </div>
      </div>
    </main>
  );
}