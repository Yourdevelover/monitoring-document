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
    <main className="space-y-5 p-4 text-slate-900">
      <div>
        <header className="border-b border-slate-300 pb-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Manajemen akun</p>
          <h1 className="mt-1 text-xl font-semibold">Kelola Karyawan</h1>
          <p className="mt-1 text-sm text-slate-500">Daftar karyawan dan informasi timnya.</p>
        </header>

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
          <p className="py-8 text-center text-sm text-slate-500">Belum ada karyawan.</p>
        )}
      </div>
    </main>
  );
}
