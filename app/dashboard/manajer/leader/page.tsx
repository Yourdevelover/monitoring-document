import { prisma } from "@/lib/prisma";
import { requireManajer } from "@/lib/auth";

export default async function ManagerLeadersPage() {
  await requireManajer();
  const leaders = await prisma.user.findMany({ where: { role: "LEADER" }, include: { ledTeam: { include: { department: true, _count: { select: { members: true } } } } }, orderBy: { name: "asc" } });
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="border-b border-[#e5e7eb] pb-3"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Seluruh departemen</p><h1 className="mt-1 text-[15px] font-semibold">Data Leader</h1></header>
        <section className="divide-y divide-[#e5e7eb] border-y border-[#d1d5db] bg-white">
          {leaders.map((leader) => <article key={leader.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center"><div><p className="text-xs font-semibold">{leader.name}</p><p className="text-[11px] text-[#6b7280]">{leader.email}</p></div><span className="text-xs">{leader.ledTeam?.department.name ?? "Belum ditetapkan"}</span><span className="truncate text-xs text-[#6b7280]">{leader.ledTeam?.name ?? "Belum ada tim"}</span><span className="text-[11px] text-[#6b7280]">{leader.ledTeam?._count.members ?? 0} anggota · {leader.isActive}</span></article>)}
          {leaders.length === 0 && <p className="px-4 py-8 text-center text-xs text-[#6b7280]">Belum ada leader.</p>}
        </section>
      </div>
    </main>
  );
}