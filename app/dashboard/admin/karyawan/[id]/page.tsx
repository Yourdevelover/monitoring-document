import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ConfirmActionForm } from "@/app/components/confirm-action-form";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";

type AdminEmployeeDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEmployeeDetailPage({ params }: AdminEmployeeDetailProps) {
  await requireAdmin();
  const { id } = await params;
  const employeeId = Number(id);

  const employee = await prisma.user.findFirst({
    where: { id: employeeId, role: "KARYAWAN" },
    include: {
      team: {
        include: {
          manager: true,
          members: { orderBy: { createdAt: "desc" } },
          uploads: { orderBy: { createdAt: "desc" }, take: 10 },
        },
      },
    },
  });

  if (!employee) notFound();

  const activities = await prisma.activityLog.findMany({
    where: {
      actorId: employee.id,
      action: { in: ["LOGIN", "LOGOUT", "UPLOAD_FILE", "SUBMIT_FILE"] },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const latestLogin = activities.find((activity) => activity.action === "LOGIN");
  const latestLogout = activities.find((activity) => activity.action === "LOGOUT");
  const latestUploadActivity = activities.find(
    (activity) => activity.action === "UPLOAD_FILE" || activity.action === "SUBMIT_FILE"
  );

  return (
    <main className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3 rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Detail</p>
          <h1 className="mt-1 text-[13px] font-semibold tracking-tight">Informasi Karyawan</h1>
        </div>
        <span className="text-xs text-[#6b7280]">{employee.isActive}</span>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-[#e5e7eb] pb-3">
        <Link href={`/dashboard/admin/karyawan/${employee.id}/edit`} className="btn">
          Edit Karyawan
        </Link>
        <form action="/api/admin/karyawan/action" method="POST">
          <input type="hidden" name="userId" value={employee.id} />
          <input type="hidden" name="action" value={employee.isActive === "ACTIVE" ? "deactivate" : "activate"} />
          <button type="submit" className="btn">
            {employee.isActive === "ACTIVE" ? "Nonaktifkan" : "Aktifkan"}
          </button>
        </form>
        <ConfirmActionForm
          action="/api/admin/karyawan/action"
          confirmMessage="Apakah Anda yakin ingin menghapus karyawan ini? Semua data terkait karyawan akan ikut terhapus."
        >
          <input type="hidden" name="userId" value={employee.id} />
          <input type="hidden" name="action" value="delete" />
          <button type="submit" className="btn btn-danger">
            Hapus
          </button>
        </ConfirmActionForm>
      </div>

      <section className="grid gap-3 rounded-lg border border-[#e5e7eb] bg-white p-4 sm:grid-cols-2">
        <div><p className="text-[11px] text-[#6b7280]">Nama</p><p className="mt-0.5 text-[13px] font-semibold">{employee.name}</p></div>
        <div><p className="text-[11px] text-[#6b7280]">Email</p><p className="mt-0.5 text-[13px] font-semibold">{employee.email}</p></div>
        <div><p className="text-[11px] text-[#6b7280]">Nomor Telepon</p><p className="mt-0.5 text-[13px] font-semibold">{employee.phoneNumber ?? "Belum diisi"}</p></div>
        <div><p className="text-[11px] text-[#6b7280]">Status</p><p className="mt-0.5 text-[13px] font-semibold">{employee.isActive}</p></div>
        <div><p className="text-[11px] text-[#6b7280]">Role</p><p className="mt-0.5 text-[13px] font-semibold">{employee.role}</p></div>
        <div><p className="text-[11px] text-[#6b7280]">Akun dibuat</p><p className="mt-0.5 text-[13px] font-semibold">{new Date(employee.createdAt).toLocaleString("id-ID")}</p></div>
      </section>

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wide">Aktivitas Terakhir</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-[11px] text-[#6b7280]">Login terakhir</p>
            <p className="text-[13px] font-semibold">{latestLogin ? new Date(latestLogin.createdAt).toLocaleString("id-ID") : "Belum ada data"}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#6b7280]">Logout terakhir</p>
            <p className="text-[13px] font-semibold">{latestLogout ? new Date(latestLogout.createdAt).toLocaleString("id-ID") : "Belum ada data"}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#6b7280]">Upload terakhir</p>
            <p className="text-[13px] font-semibold">{latestUploadActivity ? new Date(latestUploadActivity.createdAt).toLocaleString("id-ID") : "Belum ada data"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="mb-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide">Informasi Manajer</h2>
        </div>

        {employee.team?.manager ? (
          <Link
            href={`/dashboard/admin/managers/${employee.team.manager.id}`}
            className="block rounded-md border border-[#e5e7eb] bg-[#f8f9fa] p-4 transition hover:bg-[#f8f9fa]"
          >
            <p className="text-[13px] font-semibold text-[#111111]">{employee.team.manager.name}</p>
            <p className="mt-1 text-xs text-[#6b7280]">{employee.team.manager.email}</p>
          </Link>
        ) : (
          <p className="text-[13px] text-[#6b7280]">Karyawan belum memiliki manajer.</p>
        )}
      </section>

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="mb-3 flex items-center justify-between border-b border-[#e5e7eb] pb-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide">Tim</h2>
          <span className="text-[11px] text-[#6b7280]">{employee.team?.members.length ?? 0} anggota</span>
        </div>

        {employee.team ? (
          <>
            <p className="mb-3 text-[13px] text-[#111111]">Nama tim: <strong>{employee.team.name}</strong></p>
            <div className="divide-y divide-slate-200 border-y border-[#e5e7eb]">
              {employee.team.members.map((member) => (
                <div key={member.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 py-2 text-[13px]">
                  <span className="truncate font-medium">{member.name}</span>
                  <span className="truncate text-[#6b7280]">{member.email}</span>
                  <span className="text-[11px] text-[#6b7280]">{member.isActive}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-[13px] text-[#6b7280]">Karyawan belum memiliki tim.</p>
        )}
      </section>

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="mb-3 border-b border-[#e5e7eb] pb-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide">Berkas Tim</h2>
        </div>

        <div className="divide-y divide-slate-200 border-y border-[#e5e7eb]">
          {employee.team?.uploads.length ? (
            employee.team.uploads.map((upload) => (
              <div key={upload.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2 text-[13px]">
                <span className="truncate" title={upload.fileName}>{upload.fileName}</span>
                <span className="text-[11px] text-[#6b7280]">{upload.category}</span>
              </div>
            ))
          ) : (
            <p className="py-4 text-[13px] text-[#6b7280]">Belum ada berkas tim.</p>
          )}
        </div>
      </section>

      <div className="flex justify-end">
        <BackToPreviousButton />
      </div>
    </main>
  );
}
