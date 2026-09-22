import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/auth";
import { PaginationControls } from "@/app/components/pagination-controls";

export default async function ManagerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const manager = await requireManager();
  const params = await searchParams;
  const pageSize = 6;
  const requestedPage = Math.max(1, Number(params.page) || 1);

  const team = await prisma.team.findUnique({
    where: { managerId: manager.id },
    include: {
      manager: true,
      uploads: {
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          user: true,
        },
      },
      announcements: {
        orderBy: { createdAt: "desc" },
        take: 6,
      },
    },
  });

  if (!team) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold">Dashboard Manajer</h1>
          <p className="mt-3 text-slate-600">
            Tim Anda belum tersedia. Silakan buat data tim melalui proses pendaftaran manajer.
          </p>
        </div>
      </main>
    );
  }

  const [totalEmployees, activeEmployees] = await Promise.all([
    prisma.user.count({ where: { teamId: team.id, role: "KARYAWAN" } }),
    prisma.user.count({ where: { teamId: team.id, role: "KARYAWAN", isActive: "ACTIVE" } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalEmployees / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const members = await prisma.user.findMany({
    where: { teamId: team.id, role: "KARYAWAN" },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const pendingRequests = await prisma.profileRequest.count({
    where: {
      user: {
        teamId: team.id,
      },
      status: "PENDING",
    },
  });

  const summary = {
    totalEmployees,
    activeEmployees,
    totalUploads: team.uploads.length,
    totalAnnouncements: team.announcements.length,
    pendingProfileRequests: pendingRequests,
  };

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Ringkasan Tim
          </p>
          <h1 className="mt-2 text-3xl font-bold">Dashboard Manajer</h1>
          <p className="mt-2 text-slate-600">
            {manager.name} • {team.name}
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["Karyawan", summary.totalEmployees],
            ["Karyawan Aktif", summary.activeEmployees],
            ["File Tim", summary.totalUploads],
            ["Pengumuman", summary.totalAnnouncements],
            ["Profil Pending", summary.pendingProfileRequests],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-3 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-8 xl:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Anggota Tim</h2>
            <div className="mt-4 space-y-3">
              {members.map((member) => (
                <div key={member.id} className="rounded-xl border border-slate-200 p-3">
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-slate-500">{member.email}</p>
                </div>
              ))}
              <PaginationControls
                basePath="/dashboard/manajer"
                page={page}
                totalItems={totalEmployees}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">File Terbaru</h2>
            <div className="mt-4 space-y-3">
              {team.uploads.map((upload) => (
                <div key={upload.id} className="rounded-xl border border-slate-200 p-3">
                  <p className="font-medium">{upload.title}</p>
                  <p className="text-sm text-slate-500">
                    {upload.category} • {upload.user.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
