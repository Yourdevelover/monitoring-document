import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { EmployeeSearchList } from "./employee-search-list";

export default async function AdminEmployeesPage() {
  await requireAdmin();

  const employees = await prisma.user.findMany({
    where: { role: "KARYAWAN" },
    include: {
      team: {
        include: {
          manager: true,
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
      <header className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Manajemen akun</p>
        <h1 className="mt-1 text-[13px] font-semibold tracking-tight">Kelola Karyawan</h1>
        <p className="mt-1 text-xs text-[#6b7280]">Daftar karyawan dan informasi timnya.</p>
      </header>
      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        {employees.length > 0 ? (
          <EmployeeSearchList
            employees={employees.map((employee) => ({
              id: employee.id,
              name: employee.name,
              email: employee.email,
              phoneNumber: employee.phoneNumber,
              isActive: employee.isActive,
              createdAt: employee.createdAt,
              latestLoginAt: employee.activityLogs[0]?.createdAt ?? null,
              team: employee.team
                ? {
                    name: employee.team.name,
                    manager: employee.team.manager
                      ? { id: employee.team.manager.id, name: employee.team.manager.name }
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
