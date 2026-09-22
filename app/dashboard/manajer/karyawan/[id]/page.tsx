import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/auth";
import Link from "next/link";
import { ConfirmActionForm } from "@/app/components/confirm-action-form";

type ManagerEmployeeDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function ManagerEmployeeDetailPage({ params }: ManagerEmployeeDetailProps) {
  const manager = await requireManager();
  const { id } = await params;
  const employeeId = Number(id);
  const team = await prisma.team.findUnique({ where: { managerId: manager.id } });
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
  const visibleActivities = activities.filter((activity) => activity.action !== "LOGIN");

  if (!employee) {
    return <p className="text-sm text-slate-600">Karyawan tidak ditemukan.</p>;
  }

  return (
    <main className="min-h-screen text-slate-900">
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="border-b border-slate-200 pb-4">
          <Link href="/dashboard/manajer/karyawan" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
            ← Daftar Karyawan
          </Link>
          <h1 className="mt-2 text-xl font-semibold">Informasi Karyawan</h1>
        </div>

        <div className="grid gap-3 divide-y divide-slate-200 border-y border-slate-200">
          <div className="py-3">
            <p className="text-xs text-slate-500">Nama</p>
            <p className="font-semibold text-slate-900">{employee.name}</p>
          </div>
          <div className="py-3">
            <p className="text-xs text-slate-500">Email</p>
            <p className="font-semibold text-slate-900">{employee.email}</p>
          </div>
          <div className="py-3">
            <p className="text-xs text-slate-500">Status</p>
            <p className="font-semibold text-slate-900">{employee.isActive}</p>
          </div>
          <div className="py-3">
            <p className="text-xs text-slate-500">Bergabung</p>
            <p className="font-semibold text-slate-900">
              {new Date(employee.createdAt).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <section className="space-y-4 border-y border-slate-200 py-4">
          <div>
            <h2 className="text-base font-semibold">Aktivitas Karyawan</h2>
            <p className="mt-1 text-xs text-slate-500">Login, logout, upload, dan pengiriman berkas terakhir.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Login terakhir", activity: activities.find((item) => item.action === "LOGIN") },
              { label: "Logout terakhir", activity: activities.find((item) => item.action === "LOGOUT") },
              { label: "Upload terakhir", activity: activities.find((item) => item.action === "UPLOAD_FILE" || item.action === "SUBMIT_FILE") },
            ].map(({ label, activity }) => (
              <div key={label} className="border border-slate-200 p-3">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {activity
                    ? new Date(activity.createdAt).toLocaleString("id-ID")
                    : label === "Upload terakhir" && latestUpload
                      ? new Date(latestUpload.createdAt).toLocaleString("id-ID")
                      : "Belum ada data"}
                </p>
              </div>
            ))}
          </div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {visibleActivities.map((activity) => (
              <div key={activity.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-700">{activity.description}</p>
                <time dateTime={activity.createdAt.toISOString()} className="shrink-0 text-xs text-slate-500">
                  {new Date(activity.createdAt).toLocaleString("id-ID")}
                </time>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/manajer/karyawan" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Kembali
          </Link>
          {employee.isActive === "ACTIVE" && (
            <ConfirmActionForm action="/api/manager/employee/action" confirmMessage={`Nonaktifkan akun ${employee.name}?`}>
              <input type="hidden" name="userId" value={employee.id} />
              <input type="hidden" name="action" value="deactivate" />
              <button type="submit" className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50">
                Nonaktifkan
              </button>
            </ConfirmActionForm>
          )}
          <ConfirmActionForm action="/api/manager/employee/action" confirmMessage={`Hapus karyawan ${employee.name}? Data akun dan berkasnya akan dihapus.`}>
            <input type="hidden" name="userId" value={employee.id} />
            <input type="hidden" name="action" value="delete" />
            <button type="submit" className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
              Hapus
            </button>
          </ConfirmActionForm>
        </div>
      </div>
    </main>
  );
}
