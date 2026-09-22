import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/auth";
import Link from "next/link";
import { PaginationControls } from "@/app/components/pagination-controls";

export default async function EmployeeDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const employee = await requireEmployee();

  if (!employee.teamId) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold">Dashboard Karyawan</h1>
          <p className="mt-3 text-slate-600">
            Anda belum ditugaskan ke tim. Silakan hubungi manajer Anda.
          </p>
        </div>
      </main>
    );
  }

  const pageSize = 6;
  const requestedPage = Math.max(1, Number((await searchParams).page) || 1);
  const team = await prisma.team.findUnique({
    where: { id: employee.teamId },
    include: {
      manager: true,
      announcements: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      uploads: {
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          user: true,
        },
      },
    },
  });

  if (!team) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold">Dashboard Karyawan</h1>
          <p className="mt-3 text-slate-600">
            Tim Anda belum tersedia atau telah dihapus. Silakan hubungi admin.
          </p>
        </div>
      </main>
    );
  }

  const totalMembers = await prisma.user.count({ where: { teamId: team.id, role: "KARYAWAN" } });
  const totalPages = Math.max(1, Math.ceil(totalMembers / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const members = await prisma.user.findMany({
    where: { teamId: team.id, role: "KARYAWAN" },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Ringkasan Karyawan
          </p>
          <h1 className="mt-2 text-3xl font-bold">Dashboard Karyawan</h1>
          <p className="mt-2 text-slate-600">
            {employee.name} • {team.name}
          </p>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Informasi Tim</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-sm text-slate-500">Manajer</p>
              <p className="mt-1 font-medium">{team.manager.name}</p>
            </div>

            {members.map((member) => (
              <div key={member.id} className="rounded-xl border border-slate-200 p-3">
                <Link href={`/dashboard/karyawan/profil?user=${member.id}`} className="font-medium text-blue-700 hover:text-blue-900">
                  {member.name}
                </Link>
                <p className="text-sm text-slate-500">{member.email}</p>
              </div>
            ))}
            <PaginationControls
              basePath="/dashboard/karyawan"
              page={page}
              totalItems={totalMembers}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
