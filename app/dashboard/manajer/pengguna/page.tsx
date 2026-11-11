import { prisma } from "@/lib/prisma";
import { requireManajer } from "@/lib/auth";

const roleLabels = { ADMIN: "Admin", LEADER: "Leader", KARYAWAN: "Karyawan", MANAJER: "Manajer" } as const;

export default async function ManagerUsersPage() {
  await requireManajer();
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, phoneNumber: true, role: true, isActive: true, position: true, createdAt: true, department: { select: { name: true } }, team: { select: { name: true, department: { select: { name: true } } } }, ledTeam: { select: { name: true, department: { select: { name: true } } } } },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="border-b border-[#e5e7eb] pb-3"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Seluruh akun</p><h1 className="mt-1 text-[15px] font-semibold">Data Pengguna</h1><p className="mt-1 text-xs text-[#6b7280]">{users.length} akun terdaftar</p></header>
        <section className="divide-y divide-[#e5e7eb] border-y border-[#d1d5db] bg-white">
          {users.map((user) => <article key={user.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[1.2fr_1fr_0.7fr_1fr_auto] sm:items-center"><div className="min-w-0"><p className="truncate text-xs font-semibold">{user.name}</p><p className="truncate text-[11px] text-[#6b7280]">{user.email}</p></div><span className="truncate text-xs">{user.department?.name ?? user.team?.department.name ?? user.ledTeam?.department.name ?? "-"}</span><span className="text-xs">{roleLabels[user.role]}</span><span className="truncate text-xs text-[#6b7280]">{user.position ?? user.team?.name ?? user.ledTeam?.name ?? "-"}</span><span className="text-[11px] text-[#6b7280]">{user.isActive}</span></article>)}
          {users.length === 0 && <p className="px-4 py-8 text-center text-xs text-[#6b7280]">Belum ada data pengguna.</p>}
        </section>
      </div>
    </main>
  );
}