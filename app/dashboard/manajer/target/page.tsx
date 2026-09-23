import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/auth";

export default async function ManagerTargetPage() {
  const manager = await requireManager();
  const team = await prisma.team.findUnique({
    where: { managerId: manager.id },
    include: { members: { where: { role: "KARYAWAN" }, select: { id: true, name: true } } },
  });
  const period = new Date().toISOString().slice(0, 7);
  const targets = await prisma.target.findMany({
    where: { period, user: { teamId: team?.id } },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
          <h1 className="text-[15px] font-semibold tracking-tight">Target {period}</h1>
          <p className="mt-0.5 text-xs text-[#6b7280]">Pantau target seluruh anggota tim.</p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {targets.length ? targets.map((t) => {
            const pct = t.targetValue > 0 ? (t.currentValue / t.targetValue) * 100 : 0;
            const reached = pct >= 100;
            return (
              <div key={t.id} className="rounded-lg border border-[#e5e7eb] bg-white p-4">
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
          }) : <p className="col-span-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-6 text-center text-xs text-[#6b7280]">Belum ada target bulan ini.</p>}
        </section>
      </div>
    </main>
  );
}