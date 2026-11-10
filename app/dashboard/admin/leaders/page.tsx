import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { UserManagementTabs } from "../user-management-tabs";
import { LeaderSearchList } from "./leader-search-list";

export default async function AdminLeadersPage() {
  await requireAdmin();
  const leaders = await prisma.user.findMany({
    where: { role: "LEADER" },
    include: {
      ledTeam: {
        include: { members: true, department: true },
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
      <UserManagementTabs activeRole="leaders" />

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
      {leaders.length > 0 ? (
        <LeaderSearchList
          leaders={leaders.map((leader) => ({
            id: leader.id,
            name: leader.name,
            email: leader.email,
            phoneNumber: leader.phoneNumber,
            isActive: leader.isActive,
            createdAt: leader.createdAt,
            latestLoginAt: leader.activityLogs[0]?.createdAt ?? null,
            ledTeam: leader.ledTeam
              ? {
                  name: leader.ledTeam.name,
                  department: leader.ledTeam.department.name,
                  members: leader.ledTeam.members,
                }
              : null,
          }))}
        />
      ) : (
        <p className="py-8 text-center text-sm text-[#6b7280]">Belum ada akun leader.</p>
      )}
      </section>
    </main>
  );
}
