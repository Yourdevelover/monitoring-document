import { prisma } from "@/lib/prisma";
import { requireManajer } from "@/lib/auth";

export default async function ManagerTargetsPage() {
  await requireManajer();
  const period = new Date().toISOString().slice(0, 7);
  const targets = await prisma.target.findMany({ where: { period }, include: { user: { include: { department: true, team: true, ledTeam: { include: { department: true } } } } }, orderBy: [{ user: { name: "asc" } }, { name: "asc" }] });

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="border-b border-[#e5e7eb] pb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Seluruh departemen</p>
          <h1 className="mt-1 text-[15px] font-semibold">Target {period}</h1>
          <p className="mt-1 text-xs text-[#6b7280]">{targets.length} target</p>
        </header>
        <section className="divide-y divide-[#e5e7eb] border-y border-[#d1d5db] bg-white">
          {targets.map((target) => {
            const progress = target.targetValue > 0 ? (target.currentValue / target.targetValue) * 100 : 0;
            return (
              <article key={target.id} className="grid gap-2 px-4 py-3 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-center">
                <div>
                  <p className="text-xs font-semibold">{target.user.name}</p>
                  <p className="mt-1 text-[11px] text-[#6b7280]">{target.user.department?.name ?? target.user.team?.name ?? target.user.ledTeam?.department.name ?? "-"} · {target.user.role}</p>
                </div>
                <p className="text-xs">{target.name}</p>
                <p className="text-xs text-[#6b7280]">
                  {target.currentValue.toLocaleString("id-ID")} / {target.targetValue.toLocaleString("id-ID")}
                </p>
                <span className="text-xs font-semibold">{progress.toFixed(1)}%</span>
              </article>
            );
          })}
          {targets.length === 0 && <p className="px-4 py-8 text-center text-xs text-[#6b7280]">Belum ada target pada periode ini.</p>}
        </section>
      </div>
    </main>
  );
}