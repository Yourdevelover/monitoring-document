import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ConfirmActionForm } from "@/app/components/confirm-action-form";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";
import { getUploadFileName } from "@/lib/upload-file";

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
          uploads: { orderBy: { id: "desc" }, take: 10 },
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
    orderBy: { id: "desc" },
    take: 10,
    select: { id: true, filePath: true, category: true, submissionDate: true, status: true },
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
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e9ecef] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e8f0fd] text-sm font-semibold text-[#2866b1]">
              {employee.name.trim().charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">Profil Karyawan</p>
              <h1 className="mt-0.5 break-words text-base font-semibold text-[#111111]">{employee.name}</h1>
            </div>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${employee.isActive === "ACTIVE" ? "bg-[#edf3ec] text-[#346538]" : "bg-[#f3f4f6] text-[#6b7280]"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${employee.isActive === "ACTIVE" ? "bg-[#4f8a53]" : "bg-[#9ca3af]"}`} />
            {employee.isActive === "ACTIVE" ? "Aktif" : "Nonaktif"}
          </span>
        </header>
        <div className="px-5 py-4">
          <section className="overflow-hidden rounded-md border border-[#e5e7eb]">
            <h2 className="border-b border-[#e5e7eb] bg-[#fbfcfd] px-4 py-3 text-xs font-semibold text-[#263238]">Detail Personal</h2>
            <dl className="grid gap-x-8 px-4 lg:grid-cols-2">
              {[
                ["Nama", employee.name],
                ["Nama Leader", employee.team?.leader?.name ?? "Belum ditentukan"],
                ["Email", employee.email],
                ["Nomor telepon", employee.phoneNumber ?? "Belum diisi"],
                ["NIK", employee.nik ?? "Belum diisi"],
                ["Alamat", employee.address ?? "Belum diisi"],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 border-b border-[#f1f3f5] py-3">
                  <dt className="text-xs text-[#111111]">{label}</dt>
                  <dd className={`break-words text-left text-xs font-medium ${value === "Belum diisi" || value === "Belum ditentukan" ? "text-[#9ca3af]" : "text-[#111111]"}`}>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

      <section className="mx-5 mb-4 overflow-hidden rounded-md border border-[#e5e7eb]">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-[#fbfcfd] px-4 py-3">
          <h2 className="text-xs font-semibold text-[#263238]">Berkas Terbaru</h2>
          <span className="text-[11px] text-[#6b7280]">{recentFiles.length} file</span>
        </div>
        <div className="divide-y divide-[#f1f3f5] px-4">
          {recentFiles.map((file) => (
            <a key={file.id} href={file.filePath} target="_blank" rel="noreferrer" className="grid gap-1 py-3 hover:bg-[#f8f9fa] sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
              <span className="truncate text-xs font-medium">{getUploadFileName(file.filePath)}</span>
              <span className="text-[11px] text-[#6b7280]">{file.category} · {file.status}</span>
              <time className="text-[11px] text-[#6b7280]">{file.submissionDate?.toLocaleString("id-ID") ?? "Belum dikirim"}</time>
            </a>
          ))}
          {recentFiles.length === 0 && <p className="py-4 text-xs text-[#6b7280]">Belum ada berkas.</p>}
        </div>
      </section>

      <section className="mx-5 mb-5 overflow-hidden rounded-md border border-[#e5e7eb]">
        <h2 className="border-b border-[#e5e7eb] bg-[#fbfcfd] px-4 py-3 text-xs font-semibold text-[#263238]">Aktivitas Akun Terakhir</h2>
        <dl className="grid gap-x-6 gap-y-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-l-2 border-[#5c8f68] pl-3">
            <dt className="text-[11px] text-[#6b7280]">Login terakhir</dt>
            <dd className="mt-1 text-xs font-medium tabular-nums text-[#111111]">{latestLogin ? new Date(latestLogin.createdAt).toLocaleString("id-ID") : "Belum ada data"}</dd>
          </div>
          <div className="border-l-2 border-[#c7ced3] pl-3">
            <dt className="text-[11px] text-[#6b7280]">Logout terakhir</dt>
            <dd className="mt-1 text-xs font-medium tabular-nums text-[#111111]">{latestLogout ? new Date(latestLogout.createdAt).toLocaleString("id-ID") : "Belum ada data"}</dd>
          </div>
          <div className="border-l-2 border-[#d6a64f] pl-3">
            <dt className="text-[11px] text-[#6b7280]">Upload terakhir</dt>
            <dd className="mt-1 text-xs font-medium tabular-nums text-[#111111]">{latestUploadActivity ? new Date(latestUploadActivity.createdAt).toLocaleString("id-ID") : "Belum ada data"}</dd>
          </div>
          <div className="border-l-2 border-[#8b9bb4] pl-3">
            <dt className="text-[11px] text-[#6b7280]">Bergabung</dt>
            <dd className="mt-1 text-xs font-medium tabular-nums text-[#111111]">{new Date(employee.createdAt).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}</dd>
          </div>
        </dl>
      </section>
      </section>

      <div className="flex justify-end">
        <BackToPreviousButton />
      </div>
    </main>
  );
}
