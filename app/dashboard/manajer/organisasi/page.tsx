import { prisma } from "@/lib/prisma";
import { requireManajer } from "@/lib/auth";

export default async function ManagerOrganizationPage() {
  await requireManajer();
  const departments = await prisma.department.findMany({ include: { teams: { include: { leader: true, _count: { select: { members: true } } } }, _count: { select: { users: true } } }, orderBy: { name: "asc" } });
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="border-b border-[#e5e7eb] pb-3"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Struktur organisasi</p><h1 className="mt-1 text-[15px] font-semibold">Departemen dan Tim</h1></header>
        {departments.map((department) => <section key={department.id} className="border-y border-[#d1d5db] bg-white"><div className="flex justify-between gap-3 border-b border-[#e5e7eb] px-4 py-3"><h2 className="text-xs font-semibold">{department.name}</h2><span className="text-[11px] text-[#6b7280]">{department._count.users} akun terkait</span></div><div className="divide-y divide-[#f1f3f5]">{department.teams.map((team) => <article key={team.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center"><span className="text-xs font-medium">{team.name}</span><span className="text-xs text-[#6b7280]">Leader: {team.leader.name}</span><span className="text-[11px] text-[#6b7280]">{team._count.members} anggota · {team.isActive ? "Aktif" : "Nonaktif"}</span></article>)}{department.teams.length === 0 && <p className="px-4 py-4 text-xs text-[#6b7280]">Belum ada tim.</p>}</div></section>)}
      </div>
    </main>
  );
}