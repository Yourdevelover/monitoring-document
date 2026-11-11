import { prisma } from "@/lib/prisma";
import { requireLeader } from "@/lib/auth";
import Link from "next/link";
import { EmployeeActivityHistory } from "./employee-activity-history";

type LeaderEmployeeDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function LeaderEmployeeDetailPage({
  params,
}: LeaderEmployeeDetailProps) {
  const leader = await requireLeader();
  const { id } = await params;
  const employeeId = Number(id);
  const pageSize = 13;
  const team = await prisma.team.findUnique({ where: { leaderId: leader.id } });
  const employee = team && employeeId
    ? await prisma.user.findFirst({
        where: { id: employeeId, teamId: team.id, role: "KARYAWAN" },
      })
    : null;
  const activities = employee
    ? await prisma.activityLog.findMany({
        where: {
          actorId: employee.id,
          action: { in: ["LOGIN", "LOGOUT", "UPLOAD_FILE", "SUBMIT_FILE"] },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : [];
  const latestUpload = employee
    ? await prisma.upload.findFirst({
        where: { userId: employee.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true, fileName: true },
      })
    : null;
  const visibleActivityWhere = { actorId: employee?.id ?? 0, action: { in: ["LOGOUT", "UPLOAD_FILE", "SUBMIT_FILE"] } };
  const totalVisibleActivities = employee
    ? await prisma.activityLog.count({ where: visibleActivityWhere })
    : 0;
  const totalActivityPages = Math.max(1, Math.ceil(totalVisibleActivities / pageSize));
  const initialActivities = employee
    ? await prisma.activityLog.findMany({
        where: visibleActivityWhere,
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: pageSize,
        select: { id: true, description: true, createdAt: true },
      })
    : [];

  if (!employee) {
    return <p className="text-sm text-[#6b7280]">Karyawan tidak ditemukan.</p>;
  }

  return (
    <main className="min-h-screen text-[#111111]">
      <div className="w-full space-y-4">
        <div className="border-b border-[#e5e7eb] pb-3">
          <h1 className="text-base font-semibold">Informasi Karyawan</h1>
        </div>

        <section className="overflow-hidden rounded-lg border border-[#e1e5e9] bg-white shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e9ecef] px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e8f0fd] text-sm font-semibold text-[#2866b1]">
                {employee.name.trim().charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">Profil Karyawan</p>
                <h2 className="mt-0.5 break-words text-base font-semibold text-[#111111]">{employee.name}</h2>
              </div>
            </div>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${employee.isActive === "ACTIVE" ? "bg-[#edf3ec] text-[#346538]" : "bg-[#fdebec] text-[#9f2f2d]"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${employee.isActive === "ACTIVE" ? "bg-[#4f8a53]" : "bg-[#c1423c]"}`} />
              {employee.isActive === "ACTIVE" ? "Aktif" : "Nonaktif"}
            </span>
          </header>

          <div className="px-5 py-4">
            <section className="overflow-hidden rounded-md border border-[#e5e7eb]">
              <h3 className="border-b border-[#e5e7eb] bg-[#fbfcfd] px-4 py-3 text-xs font-semibold text-[#111111]">Detail Personal</h3>
              <dl className="grid gap-x-8 px-4 lg:grid-cols-2">
                {[
                   ["Nama", employee.name],
                  ["Nama Leader", leader.name],
                  ["Email", employee.email],
                  ["NIK", employee.nik ?? "Belum diisi"],
                  ["Alamat", employee.address ?? "Belum diisi"],
                  ["Bergabung", new Date(employee.createdAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 border-b border-[#f1f3f5] py-3">
                    <dt className="text-xs font-medium text-[#111111]">{label}</dt>
                    <dd className={`break-words text-left text-xs font-medium ${value === "Belum diisi" ? "text-[#9ca3af]" : "text-[#111111]"}`}>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <section className="mx-5 mb-4 overflow-hidden rounded-md border border-[#e5e7eb]">
            <div className="border-b border-[#e5e7eb] bg-[#fbfcfd] px-4 py-3">
              <h3 className="text-xs font-semibold text-[#111111]">Aktivitas Karyawan</h3>
              <p className="mt-1 text-[11px] text-[#6b7280]">Login, logout, upload, dan pengiriman berkas terakhir.</p>
            </div>
            <div className="grid gap-2 border-b border-[#e5e7eb] p-3 sm:grid-cols-3">
              {[
                { label: "Login terakhir", activity: activities.find((item) => item.action === "LOGIN") },
                { label: "Logout terakhir", activity: activities.find((item) => item.action === "LOGOUT") },
                { label: "Upload terakhir", activity: activities.find((item) => item.action === "UPLOAD_FILE" || item.action === "SUBMIT_FILE") },
              ].map(({ label, activity }) => (
                <div key={label} className="rounded-sm border border-[#e5e7eb] bg-[#fbfcfd] p-3">
                  <p className="text-[11px] text-[#6b7280]">{label}</p>
                  <p className="mt-1 text-xs font-semibold tabular-nums text-[#111111]">
                    {activity
                      ? new Date(activity.createdAt).toLocaleString("id-ID")
                      : label === "Upload terakhir" && latestUpload
                        ? new Date(latestUpload.createdAt).toLocaleString("id-ID")
                        : "Belum ada data"}
                  </p>
                </div>
              ))}
            </div>
            <EmployeeActivityHistory
              employeeId={employee.id}
              initialPage={{
                activities: initialActivities.map((activity) => ({
                  id: activity.id,
                  description: activity.description,
                  createdAt: activity.createdAt.toISOString(),
                })),
                page: 1,
                totalPages: totalActivityPages,
                totalItems: totalVisibleActivities,
              }}
            />
          </section>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/leader/karyawan" className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f8f9fa]">
            Kembali
          </Link>
        </div>
      </div>
    </main>
  );
}
