import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { UserManagementTabs } from "../user-management-tabs";
import { EmployeeSearchList } from "./employee-search-list";

export default async function AdminEmployeesPage() {
  await requireAdmin();

  const employees = await prisma.user.findMany({
    where: { role: "KARYAWAN" },
    include: {
      // NIK only appears in admin views; team members' profile views do not expose it.
      team: {
        include: {
          leader: true,
          department: true,
          members: true,
        },
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
      <UserManagementTabs activeRole="karyawan" />
      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        {employees.length > 0 ? (
          <EmployeeSearchList
            employees={employees.map((employee) => ({
              id: employee.id,
              name: employee.name,
              email: employee.email,
              nik: employee.nik,
              phoneNumber: employee.phoneNumber,
              isActive: employee.isActive,
              createdAt: employee.createdAt,
              latestLoginAt: employee.activityLogs[0]?.createdAt ?? null,
              team: employee.team
                ? {
                    name: employee.team.name,
                  department: employee.team.department.name,
                    leader: employee.team.leader
                      ? { id: employee.team.leader.id, name: employee.team.leader.name }
                      : null,
                    members: employee.team.members,
                  }
                : null,
            }))}
          />
        ) : (
          <p className="py-8 text-center text-xs text-[#6b7280]">Belum ada karyawan.</p>
        )}
      </section>
    </main>
  );
}
