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
          leader: true,
          department: true,
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
  const recentFiles = await prisma.upload.findMany({
    where: { userId: employee.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, fileName: true, filePath: true, category: true, createdAt: true, status: true },
  });

  return (
    <main className="space-y-4">
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

      <section className="overflow-hidden rounded-lg border border-[#e1e5e9] bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">Detail Karyawan</p>
            <h1 className="mt-1 break-words text-lg font-semibold text-[#111111]">{employee.name}</h1>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${employee.isActive === "ACTIVE" ? "bg-[#edf3ec] text-[#346538]" : "bg-[#f3f4f6] text-[#6b7280]"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${employee.isActive === "ACTIVE" ? "bg-[#4f8a53]" : "bg-[#9ca3af]"}`} />
            {employee.isActive === "ACTIVE" ? "Aktif" : "Nonaktif"}
          </span>
        </header>
        <div className="border-y border-[#e9ecef] bg-[#f7f9fa] px-5 py-4">
          <h2 className="mb-3 text-xs font-semibold text-[#111111]">Aktivitas Akun Terakhir</h2>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
            <div className="border-l-2 border-[#5c8f68] pl-3">
              <dt className="text-[11px] text-[#6b7280]">Login terakhir</dt>
              <dd className="mt-1 text-xs font-medium text-[#111111]">{latestLogin ? new Date(latestLogin.createdAt).toLocaleString("id-ID") : "Belum ada data"}</dd>
            </div>
            <div className="border-l-2 border-[#c7ced3] pl-3">
              <dt className="text-[11px] text-[#6b7280]">Logout terakhir</dt>
              <dd className="mt-1 text-xs font-medium text-[#111111]">{latestLogout ? new Date(latestLogout.createdAt).toLocaleString("id-ID") : "Belum ada data"}</dd>
            </div>
            <div className="border-l-2 border-[#d6a64f] pl-3">
              <dt className="text-[11px] text-[#6b7280]">Upload terakhir</dt>
              <dd className="mt-1 text-xs font-medium text-[#111111]">{latestUploadActivity ? new Date(latestUploadActivity.createdAt).toLocaleString("id-ID") : "Belum ada data"}</dd>
            </div>
          </dl>
        </div>
        <div className="px-5 py-4">
          <h2 className="mb-2 text-xs font-semibold text-[#111111]">Rincian Profil</h2>
          <dl className="grid gap-x-8 sm:grid-cols-2">
            {[
              ["Email", employee.email],
              ["Nomor telepon", employee.phoneNumber ?? "Belum diisi"],
              ["NIK", employee.nik ?? "Belum diisi"],
              ["Alamat", employee.address ?? "Belum diisi"],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 border-b border-[#f1f3f5] py-2.5">
                <dt className="text-xs text-[#6b7280]">{label}</dt>
                <dd className="break-words text-left text-xs font-medium text-[#111111]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between border-b border-[#e5e7eb] pb-2">
          <h2 className="text-xs font-semibold text-[#111111]">Berkas Terbaru</h2>
          <span className="text-[11px] text-[#6b7280]">{recentFiles.length} file</span>
        </div>
        <div className="divide-y divide-[#f1f3f5]">
          {recentFiles.map((file) => (
            <a key={file.id} href={file.filePath} target="_blank" rel="noreferrer" className="grid gap-1 py-2.5 hover:bg-[#f8f9fa] sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
              <span className="truncate text-xs font-medium">{file.fileName}</span>
              <span className="text-[11px] text-[#6b7280]">{file.category} · {file.status}</span>
              <time className="text-[11px] text-[#6b7280]">{file.createdAt.toLocaleString("id-ID")}</time>
            </a>
          ))}
          {recentFiles.length === 0 && <p className="py-3 text-xs text-[#6b7280]">Belum ada berkas.</p>}
        </div>
      </section>

      <div className="flex justify-end">
        <BackToPreviousButton />
      </div>
    </main>
  );
}
