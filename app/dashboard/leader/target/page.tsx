import { prisma } from "@/lib/prisma";
import { requireLeader } from "@/lib/auth";
import { SaveTargetNoteButton } from "@/app/components/save-target-note-button";
import { PersonalTargetDialog } from "./personal-target-dialog";
import { MemberTargetDialog } from "./member-target-dialog";

export default async function LeaderTargetPage() {
  const leader = await requireLeader();
  const team = await prisma.team.findUnique({
    where: { leaderId: leader.id },
    include: { members: { where: { role: "KARYAWAN" }, select: { id: true, name: true } } },
  });
  const period = new Date().toISOString().slice(0, 7);
  const [targets, personalTargets] = await Promise.all([
    prisma.target.findMany({
      where: { period, user: { teamId: team?.id, role: "KARYAWAN" } },
      include: { user: { select: { name: true } } },
      orderBy: { id: "desc" },
    }),
    prisma.target.findMany({
      where: { userId: leader.id, period },
      orderBy: { id: "desc" },
    }),
  ]);
  const teamProgress = (team?.members ?? [])
    .map((member) => {
      const memberTargets = targets.filter((target) => target.userId === member.id);
      const progress = memberTargets.length
        ? memberTargets.reduce((total, target) => total + (target.targetValue > 0 ? (target.currentValue / target.targetValue) * 100 : 0), 0) / memberTargets.length
        : 0;
      return { ...member, targets: memberTargets, progress };
    })
    .sort((first, second) => second.progress - first.progress || first.name.localeCompare(second.name, "id"));

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

        <section className="border-y border-[#d1d5db] bg-white">
          <h2 className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Target Saya · {leader.name}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-xs">
              <thead>
                <tr className="border-y border-[#e5e7eb] text-[10px] uppercase tracking-wide text-[#6b7280]">
                  <th className="px-4 py-2 font-semibold">Nama Target</th>
                  <th className="whitespace-nowrap px-4 py-2 font-semibold">Progres</th>
                  <th className="px-4 py-2 font-semibold">Pencapaian</th>
                  <th className="px-4 py-2 text-right font-semibold">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {personalTargets.map((target) => {
                  const progress = target.targetValue > 0 ? (target.currentValue / target.targetValue) * 100 : 0;
                  const reached = progress >= 100;
                  return (
                    <tr key={target.id} className="border-b border-[#f1f3f5] last:border-0">
                      <td className="px-4 py-3 font-semibold">{target.name}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-[#6b7280]">
                        {target.currentValue.toLocaleString("id-ID")} / {target.targetValue.toLocaleString("id-ID")}
                      </td>
                      <td className="min-w-40 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 min-w-20 flex-1 rounded bg-[#f1f3f5]">
                            <div className={`h-full rounded ${reached ? "bg-[#346538]" : "bg-[#956400]"}`} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
                          </div>
                          <span className="w-12 text-right font-semibold">{progress.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <SaveTargetNoteButton name={target.name} current={target.currentValue} target={target.targetValue} pct={progress} />
                          <form action="/api/leader/target" method="POST" className="flex items-center gap-1.5">
                            <input type="hidden" name="action" value="update" />
                            <input type="hidden" name="id" value={target.id} />
                            <label className="sr-only" htmlFor={`leader-target-progress-${target.id}`}>Progres target {target.name}</label>
                            <input id={`leader-target-progress-${target.id}`} name="currentValue" type="number" min="0" step="any" defaultValue={String(target.currentValue)} className="w-24 rounded border border-[#d1d5db] bg-white px-2 py-1 text-xs" />
                            <button type="submit" className="rounded bg-white px-2 py-1 text-xs font-medium text-[#374151] ring-1 ring-[#d1d5db] hover:bg-[#f1f3f5]">Update</button>
                          </form>
                          <form action="/api/leader/target" method="POST">
                            <input type="hidden" name="action" value="delete" />
                            <input type="hidden" name="id" value={target.id} />
                            <button type="submit" className="text-xs font-medium text-[#9f2f2d] hover:underline">Hapus</button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {personalTargets.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-xs text-[#6b7280]">Belum ada target pribadi bulan ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border-y border-[#d1d5db] bg-white">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Daftar Anggota Tim</h2>
            <span className="text-[11px] text-[#6b7280]">{teamProgress.length} anggota</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[680px] w-full text-left text-xs">
              <thead>
                <tr className="border-y border-[#e5e7eb] text-[10px] uppercase tracking-wide text-[#6b7280]">
                  <th className="w-14 px-4 py-2 font-semibold">#</th>
                  <th className="px-4 py-2 font-semibold">Nama Karyawan</th>
                  <th className="px-4 py-2 font-semibold">Target</th>
                  <th className="w-56 px-4 py-2 font-semibold">Progres Tim</th>
                </tr>
              </thead>
              <tbody>
                {teamProgress.map((member, index) => (
                  <MemberTargetDialog
                    key={member.id}
                    memberName={member.name}
                    targets={member.targets}
                    rank={index + 1}
                    progress={member.progress}
                  />
                ))}
                {teamProgress.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-xs text-[#6b7280]">Belum ada anggota tim.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}