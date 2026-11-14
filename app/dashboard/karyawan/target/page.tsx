import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/auth";
import { SaveTargetNoteButton } from "@/app/components/save-target-note-button";

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
  const teamMembers = employee.teamId
    ? await prisma.user.findMany({
        where: { teamId: employee.teamId, role: "KARYAWAN" },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [{ id: employee.id, name: employee.name }];
  const memberIds = teamMembers.map((member) => member.id);
  const targets = memberIds.length
    ? await prisma.target.findMany({
        where: { period, userId: { in: memberIds } },
        include: { user: { select: { id: true, name: true } } },
        orderBy: [{ user: { name: "asc" } }, { name: "asc" }],
      })
    : [];
  const targetsByMember = new Map<number, typeof targets>();
  for (const target of targets) {
    const memberTargets = targetsByMember.get(target.userId) ?? [];
    memberTargets.push(target);
    targetsByMember.set(target.userId, memberTargets);
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
          <div className="flex items-baseline gap-2 whitespace-nowrap">
            <h1 className="text-[15px] font-bold tracking-tight">{todayLabel}</h1>
          </div>
          <div className="mt-2 space-y-0.5 text-xs text-[#6b7280]">
            <p>Semua target karyawan dalam tim ini dapat dilihat oleh anggota tim.</p>
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
            <div className="flex items-end sm:col-span-2 lg:col-span-3"><button type="submit" className="rounded-md bg-[#111111] px-4 py-2 text-sm font-medium text-white hover:bg-[#222]">Simpan</button></div>
          </form>
        </section>

        <section className="overflow-x-auto border-y border-[#d1d5db] bg-white">
          <table className="min-w-[760px] w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e5e7eb] text-[10px] uppercase tracking-wide text-[#6b7280]">
                <th className="px-4 py-2 font-semibold">Karyawan</th>
                <th className="px-4 py-2 font-semibold">Target</th>
                <th className="whitespace-nowrap px-4 py-2 font-semibold">Progres</th>
                <th className="px-4 py-2 font-semibold">Pencapaian</th>
                <th className="px-4 py-2 text-right font-semibold">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.flatMap((member) => {
                const memberTargets = targetsByMember.get(member.id) ?? [];
                if (memberTargets.length === 0) {
                  return [(
                    <tr key={`member-${member.id}`} className="border-b border-[#f1f3f5] last:border-0">
                      <td className="whitespace-nowrap px-4 py-3 font-semibold">{member.name}{member.id === employee.id ? " (Anda)" : ""}</td>
                      <td colSpan={4} className="px-4 py-3 text-[#9ca3af]">Belum ada target</td>
                    </tr>
                  )];
                }

                return memberTargets.map((target) => {
                  const progress = target.targetValue > 0 ? (target.currentValue / target.targetValue) * 100 : 0;
                  const reached = progress >= 100;
                  const isOwnTarget = target.userId === employee.id;
                  return (
                    <tr key={target.id} className="border-b border-[#f1f3f5] last:border-0">
                      <td className="whitespace-nowrap px-4 py-3 font-semibold">{member.name}{isOwnTarget ? " (Anda)" : ""}</td>
                      <td className="px-4 py-3">{target.name}</td>
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
                      <td className="px-4 py-3 text-right">
                        {isOwnTarget ? (
                          <div className="flex items-center justify-end gap-2">
                            <SaveTargetNoteButton name={target.name} current={target.currentValue} target={target.targetValue} pct={progress} />
                            <form action="/api/karyawan/target" method="POST">
                              <input type="hidden" name="action" value="delete" />
                              <input type="hidden" name="id" value={String(target.id)} />
                              <button type="submit" className="rounded-md border border-[#e5e7eb] px-2.5 py-1.5 text-xs font-medium hover:bg-[#f8f9fa]">Hapus</button>
                            </form>
                            <details className="text-left">
                              <summary className="cursor-pointer whitespace-nowrap rounded-md border border-[#e5e7eb] px-2.5 py-1.5 text-xs font-medium hover:bg-[#f8f9fa]">Update</summary>
                              <form action="/api/karyawan/target" method="POST" className="absolute z-10 mt-1 space-y-2 border border-[#e5e7eb] bg-white p-3 shadow-sm">
                                <input type="hidden" name="action" value="update" />
                                <input type="hidden" name="id" value={String(target.id)} />
                                <input type="hidden" name="name" value={target.name} />
                                <input type="hidden" name="targetValue" value={String(target.targetValue)} />
                                <input type="hidden" name="formula" value="bagi" />
                                <input type="hidden" name="threshold" value={String(target.threshold)} />
                                <label className="block text-xs">Progres baru<input name="currentValue" type="number" min="0" step="any" defaultValue={String(target.currentValue)} required className="mt-1 w-36 rounded-md border border-[#e5e7eb] px-2 py-1.5 text-xs" /></label>
                                <button type="submit" className="w-full rounded-md bg-[#111111] px-3 py-1.5 text-xs font-medium text-white">Simpan Progres</button>
                              </form>
                            </details>
                          </div>
                        ) : <span className="text-[#9ca3af]">-</span>}
                      </td>
                    </tr>
                  );
                });
              })}
              {teamMembers.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-[#6b7280]">Belum ada anggota tim.</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
