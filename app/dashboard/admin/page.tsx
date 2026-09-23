import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [users, teams, allTargets, recentUploads, pendingApprovals, recentActivities] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, role: true, isActive: true, teamId: true, createdAt: true } }),
    prisma.team.findMany({ orderBy: { createdAt: "desc" }, include: { members: true } }),
    prisma.target.findMany({ select: { userId: true, currentValue: true, targetValue: true, name: true, period: true, user: { select: { name: true } } } }),
    prisma.upload.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: { select: { name: true } }, team: { select: { name: true } } } }),
    prisma.profileRequest.count({ where: { status: "PENDING" } }),
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { actor: true } }),
  ]);

  const summary = {
    totalUsers: users.length,
    totalAdmins: users.filter((item) => item.role === "ADMIN").length,
    totalManagers: users.filter((item) => item.role === "MANAGER").length,
    totalEmployees: users.filter((item) => item.role === "KARYAWAN").length,
    activeTeams: teams.filter((team) => team.isActive).length,
    pendingApprovals,
    inactiveUsers: users.filter((item) => item.isActive === "INACTIVE").length,
  };

  const targetAgg = new Map<string, { cur: number; tgt: number }>();
  for (const t of allTargets) {
    const a = targetAgg.get(t.userId) ?? { cur: 0, tgt: 0 };
    a.cur += t.currentValue; a.tgt += t.targetValue;
    targetAgg.set(t.userId, a);
  }
  const topUsers = users
    .filter((u) => u.role === "KARYAWAN")
    .map((u) => {
      const a = targetAgg.get(u.id);
      const pct = a && a.tgt > 0 ? Math.round((a.cur / a.tgt) * 100) : 0;
      return { name: u.name, count: pct };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxUser = Math.max(1, ...topUsers.map((u) => u.count));

  const targetCount = allTargets.length;
  const targetReached = allTargets.filter((t) => t.targetValue > 0 && (t.currentValue / t.targetValue) * 100 >= 100).length;
  const targetAvg = allTargets.length ? Math.round(allTargets.reduce((s, t) => s + (t.targetValue > 0 ? (t.currentValue / t.targetValue) * 100 : 0), 0) / allTargets.length) : 0;
  const targetPctList = allTargets
    .filter((t) => t.targetValue > 0)
    .map((t) => ({ name: t.user.name ?? t.name, pct: Math.round((t.currentValue / t.targetValue) * 100), current: t.currentValue, target: t.targetValue }))
    .sort((a, b) => b.pct - a.pct);

  const teamAgg = new Map<number, { cur: number; tgt: number; count: number; teamName: string; managerName: string }>();
  for (const t of allTargets) {
    const user = users.find((u) => u.id === t.userId);
    const teamId = user?.teamId;
    if (!teamId) continue;
    const team = teams.find((tm) => tm.id === teamId);
    const a = teamAgg.get(teamId) ?? { cur: 0, tgt: 0, count: 0, teamName: team?.name ?? "?", managerName: "?" };
    a.cur += t.currentValue;
    a.tgt += t.targetValue;
    a.count++;
    const manager = users.find((u) => u.id === team?.managerId);
    if (manager) a.managerName = manager.name;
    teamAgg.set(teamId, a);
  }
  const teamSummaryList = Array.from(teamAgg.entries()).map(([teamId, a]) => ({
    teamId,
    teamName: a.teamName,
    managerName: a.managerName,
    targetCount: a.count,
    pct: a.tgt > 0 ? Math.round((a.cur / a.tgt) * 100) : 0,
  })).sort((a, b) => b.pct - a.pct);

  const statCards = [
    { label: "Total Pengguna", value: summary.totalUsers, accent: "bg-[#e1f3fe] text-[#1f6c9f]" },
    { label: "Admin", value: summary.totalAdmins, accent: "bg-[#fdebec] text-[#9f2f2d]" },
    { label: "Manajer", value: summary.totalManagers, accent: "bg-[#fbf3db] text-[#956400]" },
    { label: "Karyawan", value: summary.totalEmployees, accent: "bg-[#edf3ec] text-[#346538]" },
    { label: "Tim Aktif", value: summary.activeTeams, accent: "bg-[#edf3ec] text-[#346538]" },
    { label: "Total File", value: summary.totalUploads, accent: "bg-[#e1f3fe] text-[#1f6c9f]" },
    { label: "Persetujuan Tertunda", value: summary.pendingApprovals, accent: "bg-[#fbf3db] text-[#956400]" },
    { label: "Akun Tidak Aktif", value: summary.inactiveUsers, accent: "bg-[#fdebec] text-[#9f2f2d]" },
  ];

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="flex flex-col gap-3 rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Ringkasan Administrasi</p>
            <h1 className="mt-1 text-[15px] font-semibold tracking-tight">Dashboard Admin</h1>
            <p className="mt-0.5 text-xs text-[#6b7280]">{summary.totalUsers} pengguna • {summary.activeTeams} tim aktif • {summary.pendingApprovals} pending</p>
          </div>
          <form action="/api/logout" method="POST">
            <button type="submit" className="rounded-md border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-medium text-[#111111] hover:bg-[#f8f9fa]">Keluar</button>
          </form>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#6b7280]">{card.label}</p>
                <p className="mt-1 text-[15px] font-semibold tracking-tight">{card.value}</p>
              </div>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${card.accent}`}>{card.value}</span>
            </div>
          ))}
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Target Aktif", value: targetCount, accent: "bg-[#e1f3fe] text-[#1f6c9f]" },
            { label: "Tercapai (100%)", value: targetReached, accent: "bg-[#edf3ec] text-[#346538]" },
            { label: "Rata-rata", value: `${targetAvg}%`, accent: "bg-[#fbf3db] text-[#956400]" },
            { label: "Total Karyawan", value: summary.totalEmployees, accent: "bg-[#f1f3f5] text-[#111111]" },
          ].map((card) => (
            <div key={card.label} className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#6b7280]">{card.label}</p>
                <p className="mt-1 text-[15px] font-semibold tracking-tight">{card.value}</p>
              </div>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${card.accent}`}>{typeof card.value === "string" ? "%" : card.value}</span>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide">Ringkasan per Tim</h2>
            {teamSummaryList.length ? (
              <div className="space-y-2">
                {teamSummaryList.map((ts) => (
                  <div key={ts.teamId} className="flex items-center gap-2">
                    <p className="flex-1 truncate text-[12px] font-medium">{ts.teamName}</p>
                    <p className="w-20 text-right text-[11px] text-[#6b7280]">{ts.managerName}</p>
                    <div className="h-4 w-24 flex-shrink-0 rounded bg-[#f1f3f5]">
                      <div className={`h-full rounded ${ts.pct >= 100 ? "bg-[#346538]" : "bg-[#956400]"}`} style={{ width: `${Math.min(100, ts.pct)}%` }} />
                    </div>
                    <p className={`w-12 text-right text-[11px] font-semibold ${ts.pct >= 100 ? "text-[#346538]" : "text-[#956400]"}`}>{ts.pct}%</p>
                  </div>
                ))}
              </div>
            ) : <p className="py-4 text-center text-xs text-[#6b7280]">Belum ada data.</p>}
          </div>
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide">Daftar Target Karyawan</h2>
          {targetPctList.length ? (
            <div className="space-y-2">
              {targetPctList.map((t) => (
                <div key={t.name} className="flex items-center gap-2">
                  <p className="flex-1 truncate text-[12px] font-medium">{t.name}</p>
                  <div className="h-4 w-32 flex-shrink-0 rounded bg-[#f1f3f5]">
                    <div className={`h-full rounded ${t.pct >= 100 ? "bg-[#346538]" : "bg-[#956400]"}`} style={{ width: `${Math.min(100, t.pct)}%` }} />
                  </div>
                  <p className="w-16 text-right text-[11px] text-[#6b7280]">{t.current.toLocaleString("id-ID")}/{t.target.toLocaleString("id-ID")}</p>
                  <p className={`w-10 text-right text-[11px] font-semibold ${t.pct >= 100 ? "text-[#346538]" : t.pct >= 50 ? "text-[#956400]" : "text-[#9f2f2d]"}`}>{t.pct}%</p>
                </div>
              ))}
            </div>
          ) : <p className="py-4 text-center text-xs text-[#6b7280]">Belum ada target.</p>}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="rounded-lg border border-[#e5e7eb] bg-white">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide">Aktivitas Terbaru</h2>
              <span className="text-[11px] text-[#6b7280]">{recentActivities.length} log</span>
            </div>
            <div className="divide-y divide-[#f1f3f5]">
              {recentActivities.length ? recentActivities.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium leading-tight">{item.action}</p>
                    <p className="mt-0.5 truncate text-xs text-[#6b7280]">{item.actor?.name ?? "System"} • {item.description}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-[#9ca3af]">{new Date(item.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}</span>
                </div>
              )) : <p className="px-4 py-6 text-center text-xs text-[#6b7280]">Belum ada aktivitas.</p>}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border border-[#e5e7eb] bg-white">
              <div className="border-b border-[#e5e7eb] px-4 py-3"><h2 className="text-xs font-semibold uppercase tracking-wide">Status Sistem</h2></div>
              <div className="space-y-2 p-3">
                <div className="flex items-center gap-2 rounded-md bg-[#edf3ec] px-3 py-2 text-xs font-medium text-[#346538]"><span className="h-1.5 w-1.5 rounded-full bg-[#346538]" />Database terhubung</div>
                <div className="flex items-center gap-2 rounded-md bg-[#e1f3fe] px-3 py-2 text-xs font-medium text-[#1f6c9f]"><span className="h-1.5 w-1.5 rounded-full bg-[#1f6c9f]" />Login admin aktif</div>
                <div className="flex items-center gap-2 rounded-md bg-[#fbf3db] px-3 py-2 text-xs font-medium text-[#956400]"><span className="h-1.5 w-1.5 rounded-full bg-[#956400]" />Seed admin tersedia</div>
              </div>
            </div>
            <div className="rounded-lg border border-[#e5e7eb] bg-white p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide">Ringkasan</h3>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md bg-[#f8f9fa] px-3 py-2"><dt className="text-[#6b7280]">Admin</dt><dd className="mt-0.5 text-sm font-semibold">{summary.totalAdmins}</dd></div>
                <div className="rounded-md bg-[#f8f9fa] px-3 py-2"><dt className="text-[#6b7280]">Manajer</dt><dd className="mt-0.5 text-sm font-semibold">{summary.totalManagers}</dd></div>
                <div className="rounded-md bg-[#f8f9fa] px-3 py-2"><dt className="text-[#6b7280]">Karyawan</dt><dd className="mt-0.5 text-sm font-semibold">{summary.totalEmployees}</dd></div>
                <div className="rounded-md bg-[#f8f9fa] px-3 py-2"><dt className="text-[#6b7280]">Tidak aktif</dt><dd className="mt-0.5 text-sm font-semibold">{summary.inactiveUsers}</dd></div>
              </dl>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide">File Terbaru</h2>
            <span className="text-[11px] text-[#6b7280]">{recentUploads.length} file</span>
          </div>
          <div className="divide-y divide-[#f1f3f5]">
            {recentUploads.length ? recentUploads.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{u.title}</p>
                  <p className="truncate text-xs text-[#6b7280]">{u.user.name} • {u.team.name} • {u.category}</p>
                </div>
                <span className="shrink-0 text-[11px] text-[#9ca3af]">{new Date(u.createdAt).toLocaleDateString("id-ID", { dateStyle: "short" })}</span>
              </div>
            )) : <p className="px-4 py-6 text-center text-xs text-[#6b7280]">Belum ada file.</p>}
          </div>
        </section>

        <section className="rounded-lg border border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide">Daftar User</h2>
            <span className="text-[11px] text-[#6b7280]">{users.length} akun</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead><tr className="border-b border-[#e5e7eb] bg-[#f8f9fa] text-[11px] font-semibold uppercase tracking-wide text-[#6b7280]"><th className="px-4 py-2">Nama</th><th className="px-4 py-2">Email</th><th className="px-4 py-2">Role</th><th className="px-4 py-2">Status</th></tr></thead>
              <tbody className="divide-y divide-[#f1f3f5] text-[13px]">
                {users.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f8f9fa]">
                    <td className="px-4 py-2.5 font-medium">{item.name}</td>
                    <td className="px-4 py-2.5 text-[#6b7280]">{item.email}</td>
                    <td className="px-4 py-2.5"><span className="rounded bg-[#f1f3f5] px-1.5 py-0.5 text-[11px] font-medium">{item.role}</span></td>
                    <td className="px-4 py-2.5"><span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${item.isActive === "ACTIVE" ? "bg-[#edf3ec] text-[#346538]" : "bg-[#fdebec] text-[#9f2f2d]"}`}>{item.isActive}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
