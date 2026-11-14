import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireManajer } from "@/lib/auth";

export default async function ManagerDashboardPage() {
  const manager = await requireManajer();
  const period = new Date().toISOString().slice(0, 7);
  const [roleCounts, activeEmployees, totalTeams, uploads, teamsWithTargets, departments] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.user.count({ where: { role: "KARYAWAN", isActive: "ACTIVE" } }),
    prisma.team.count(),
    prisma.upload.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        fileName: true,
        createdAt: true,
        user: { select: { name: true } },
        team: { select: { department: { select: { name: true } } } },
      },
    }),
    prisma.team.findMany({
      select: {
        leader: { select: { targets: { where: { period }, select: { targetValue: true, currentValue: true } } } },
        members: { select: { targets: { where: { period }, select: { targetValue: true, currentValue: true } } } },
      },
    }),
    prisma.department.findMany({ include: { _count: { select: { users: true, teams: true } } }, orderBy: { name: "asc" } }),
  ]);
  const countsByRole = new Map(roleCounts.map((item) => [item.role, item._count._all]));
  const totalUsers = roleCounts.reduce((sum, item) => sum + item._count._all, 0);
  const teamProgress = teamsWithTargets.map((team) => {
    const targets = [
      ...team.leader.targets,
      ...team.members.flatMap((member) => member.targets),
    ];
    const targetValue = targets.reduce((sum, target) => sum + target.targetValue, 0);
    const currentValue = targets.reduce((sum, target) => sum + target.currentValue, 0);
    return { hasTargets: targets.length > 0, targetValue, currentValue };
  });
  const teamsWithCurrentTargets = teamProgress.filter((team) => team.hasTargets);
  const averageProgress = teamsWithCurrentTargets.length
    ? Math.round(teamsWithCurrentTargets.reduce((sum, team) => sum + (team.targetValue > 0 ? team.currentValue / team.targetValue * 100 : 0), 0) / teamsWithCurrentTargets.length)
    : 0;
  const cards = [
    { label: "Seluruh pengguna", value: totalUsers, href: "/dashboard/manajer/pengguna" },
    { label: "Admin", value: countsByRole.get("ADMIN") ?? 0, href: "/dashboard/manajer/pengguna?role=ADMIN" },
    { label: "Leader", value: countsByRole.get("LEADER") ?? 0, href: "/dashboard/manajer/pengguna?role=LEADER" },
    { label: "Manajer", value: countsByRole.get("MANAJER") ?? 0, href: "/dashboard/manajer/pengguna?role=MANAJER" },
    { label: "Karyawan", value: countsByRole.get("KARYAWAN") ?? 0, href: "/dashboard/manajer/pengguna?role=KARYAWAN" },
    { label: "Karyawan aktif", value: activeEmployees, href: "/dashboard/manajer/pengguna?role=KARYAWAN" },
    { label: "Tim", value: totalTeams, href: "/dashboard/manajer/tim" },
    { label: "Berkas tersimpan", value: await prisma.upload.count(), href: "/dashboard/manajer/berkas" },
    { label: "Tim dengan target bulan ini", value: teamsWithCurrentTargets.length, href: "/dashboard/manajer/pengguna?role=TEAM" },
    { label: "Rata-rata target tim", value: `${averageProgress}%`, href: "/dashboard/manajer/pengguna?role=TEAM_TARGETS" },
  ];

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="border-b border-[#e5e7eb] pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Panel pemantauan</p>
          <h1 className="mt-1 text-[15px] font-semibold">Dashboard Manajer</h1>
          <p className="mt-1 text-xs text-[#6b7280]">{manager.name} · Data seluruh departemen · Akses baca</p>
        </header>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {cards.map((card) => (
            <Link key={card.label} href={card.href} className="flex min-h-[68px] items-center justify-between gap-3 rounded-md border border-[#e5e7eb] bg-white px-3.5 py-3 hover:bg-[#f8f9fa]">
              <span className="text-xs text-[#6b7280]">{card.label}</span>
              <strong className="text-lg tabular-nums">{card.value}</strong>
            </Link>
          ))}
        </section>
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="border-y border-[#d1d5db] bg-white">
            <h2 className="border-b border-[#e5e7eb] px-4 py-3 text-xs font-semibold uppercase">Departemen</h2>
            {departments.map((department) => (
              <div key={department.id} className="flex items-center justify-between gap-3 border-b border-[#f1f3f5] px-4 py-2.5 text-xs last:border-0">
                <span>{department.name}</span>
                <span className="text-[#6b7280]">{department._count.users} karyawan · {department._count.teams} tim</span>
              </div>
            ))}
          </div>
          <div className="border-y border-[#d1d5db] bg-white">
            <h2 className="border-b border-[#e5e7eb] px-4 py-3 text-xs font-semibold uppercase">Berkas terbaru</h2>
            {uploads.map((upload) => (
              <div key={upload.id} className="border-b border-[#f1f3f5] px-4 py-2.5 last:border-0">
                <p className="truncate text-xs font-medium">{upload.fileName}</p>
                <p className="mt-1 text-[11px] text-[#6b7280]">{upload.user.name} · {upload.team.department.name} · {new Date(upload.createdAt).toLocaleString("id-ID")}</p>
              </div>
            ))}
            {uploads.length === 0 && <p className="px-4 py-5 text-xs text-[#6b7280]">Belum ada berkas.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
