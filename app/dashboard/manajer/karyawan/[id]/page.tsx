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
    return <p className="text-sm text-[#6b7280]">Karyawan tidak ditemukan.</p>;
  }

  return (
    <main className="min-h-screen text-[#111111]">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="border-b border-[#e5e7eb] pb-4">
          <Link href="/dashboard/manajer/karyawan" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
            ← Daftar Karyawan
          </Link>
          <h1 className="text-base font-bold">Informasi Karyawan</h1>
        </div>

        <div className="grid gap-3 divide-y divide-slate-200 border-y border-[#e5e7eb]">
          <div className="py-3">
            <p className="text-xs text-[#6b7280]">Nama</p>
            <p className="font-semibold text-[#111111]">{employee.name}</p>
          </div>
          <div className="py-3">
            <p className="text-xs text-[#6b7280]">Email</p>
            <p className="font-semibold text-[#111111]">{employee.email}</p>
          </div>
          <div className="py-3">
            <p className="text-xs text-[#6b7280]">Status</p>
            <p className="font-semibold text-[#111111]">{employee.isActive}</p>
          </div>
          <div className="py-3">
            <p className="text-xs text-[#6b7280]">Bergabung</p>
            <p className="font-semibold text-[#111111]">
              {new Date(employee.createdAt).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <section className="space-y-4 border-y border-[#e5e7eb] py-4">
          <div>
            <h2 className="text-base font-semibold">Aktivitas Karyawan</h2>
            <p className="mt-1 text-xs text-[#6b7280]">Login, logout, upload, dan pengiriman berkas terakhir.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Login terakhir", activity: activities.find((item) => item.action === "LOGIN") },
              { label: "Logout terakhir", activity: activities.find((item) => item.action === "LOGOUT") },
              { label: "Upload terakhir", activity: activities.find((item) => item.action === "UPLOAD_FILE" || item.action === "SUBMIT_FILE") },
            ].map(({ label, activity }) => (
              <div key={label} className="border border-[#e5e7eb] p-3">
                <p className="text-xs text-[#6b7280]">{label}</p>
                <p className="mt-1 text-sm font-semibold text-[#111111]">
                  {activity
                    ? new Date(activity.createdAt).toLocaleString("id-ID")
                    : label === "Upload terakhir" && latestUpload
                      ? new Date(latestUpload.createdAt).toLocaleString("id-ID")
                      : "Belum ada data"}
                </p>
              </div>
            ))}
          </div>
          <div className="divide-y divide-slate-200 border-y border-[#e5e7eb]">
            {visibleActivities.map((activity) => (
              <div key={activity.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#111111]">{activity.description}</p>
                <time dateTime={activity.createdAt.toISOString()} className="shrink-0 text-xs text-[#6b7280]">
                  {new Date(activity.createdAt).toLocaleString("id-ID")}
                </time>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/manajer/karyawan" className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f8f9fa]">
            Kembali
          </Link>
          {employee.isActive === "ACTIVE" && (
            <ConfirmActionForm action="/api/manager/employee/action" confirmMessage={`Nonaktifkan akun ${employee.name}?`}>
              <input type="hidden" name="userId" value={employee.id} />
              <input type="hidden" name="action" value="deactivate" />
              <button type="submit" className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-semibold text-[#956400] hover:bg-[#fbf3db]">
                Nonaktifkan
              </button>
            </ConfirmActionForm>
          )}
          <ConfirmActionForm action="/api/manager/employee/action" confirmMessage={`Hapus karyawan ${employee.name}? Data akun dan berkasnya akan dihapus.`}>
            <input type="hidden" name="userId" value={employee.id} />
            <input type="hidden" name="action" value="delete" />
            <button type="submit" className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-[#9f2f2d] hover:bg-[#fdebec]">
              Hapus
            </button>
          </ConfirmActionForm>
        </div>
      </div>
    </main>
  );
}
