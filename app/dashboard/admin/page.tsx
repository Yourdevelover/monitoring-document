import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const user = await requireAdmin();

  const [users, teams, uploads, pendingApprovals, recentActivities] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    }),
    prisma.team.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        members: true,
      },
    }),
    prisma.upload.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.profileRequest.count({
      where: { status: "PENDING" },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        actor: true,
      },
    }),
  ]);

  const summary = {
    totalUsers: users.length,
    totalAdmins: users.filter((item) => item.role === "ADMIN").length,
    totalManagers: users.filter((item) => item.role === "MANAGER").length,
    totalEmployees: users.filter((item) => item.role === "KARYAWAN").length,
    activeTeams: teams.filter((team) => team.isActive).length,
    totalUploads: uploads.length,
    pendingApprovals,
    inactiveUsers: users.filter((item) => item.isActive === "INACTIVE").length,
  };

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
              Ringkasan Administrasi
            </p>
            <h1 className="mt-2 text-3xl font-bold">Dashboard Admin</h1>
          </div>
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 font-medium text-red-700 transition hover:bg-red-100"
            >
              Keluar
            </button>
          </form>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total Pengguna", summary.totalUsers],
            ["Admin", summary.totalAdmins],
            ["Manajer", summary.totalManagers],
            ["Karyawan", summary.totalEmployees],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-3 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Tim Aktif", summary.activeTeams],
            ["Total File", summary.totalUploads],
            ["Persetujuan Tertunda", summary.pendingApprovals],
            ["Akun Tidak Aktif", summary.inactiveUsers],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-3 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Aktivitas Terbaru</h2>
            <div className="mt-4 space-y-3">
              {recentActivities.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                  <div>
                    <p className="font-medium">{item.action}</p>
                    <p className="text-sm text-slate-500">
                      {item.actor?.name ?? "System"} • {item.description}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Status Sistem</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                Database terhubung ke Data_monitoring
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                Login admin aktif tanpa register
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                Akun admin bisa dibuat melalui seed
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Daftar User</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4">Nama</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4">{item.name}</td>
                    <td className="py-3 pr-4">{item.email}</td>
                    <td className="py-3 pr-4">{item.role}</td>
                    <td className="py-3 pr-4">{item.isActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
