import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ManagerSearchList } from "./manager-search-list";

export default async function AdminManagersPage() {
  await requireAdmin();
  const managers = await prisma.user.findMany({
    where: { role: "MANAGER" },
    include: {
      managedTeam: {
        include: { members: true },
      },
      activityLogs: {
        where: { action: "LOGIN" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="space-y-4">
      <header className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Manajemen akun</p>
        <h1 className="mt-1 text-[13px] font-semibold tracking-tight">Kelola Manajer</h1>
        <p className="mt-1 text-xs text-[#6b7280]">Daftar manajer dan informasi tim yang dikelola.</p>
      </header>

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
      {managers.length > 0 ? (
        <ManagerSearchList
          managers={managers.map((manager) => ({
            id: manager.id,
            name: manager.name,
            email: manager.email,
            phoneNumber: manager.phoneNumber,
            isActive: manager.isActive,
            createdAt: manager.createdAt,
            latestLoginAt: manager.activityLogs[0]?.createdAt ?? null,
            managedTeam: manager.managedTeam
              ? {
                  name: manager.managedTeam.name,
                  members: manager.managedTeam.members,
                }
              : null,
          }))}
        />
      ) : (
        <p className="py-8 text-center text-sm text-[#6b7280]">Belum ada akun manajer.</p>
      )}
      </section>
    </main>
  );
}
