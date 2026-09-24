import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ConfirmActionForm } from "@/app/components/confirm-action-form";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";

type ManagerDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminManagerDetailPage({ params }: ManagerDetailProps) {
  await requireAdmin();
  const { id } = await params;
  const manager = await prisma.user.findFirst({
    where: { id: Number(id), role: "MANAGER" },
    include: {
      managedTeam: {
        include: {
          members: { orderBy: { createdAt: "desc" } },
          uploads: { orderBy: { createdAt: "desc" }, take: 10 },
        },
      },
    },
  });

  if (!manager) notFound();

  const activities = await prisma.activityLog.findMany({
    where: {
      actorId: manager.id,
      action: { in: ["LOGIN", "LOGOUT", "UPLOAD_FILE", "SUBMIT_FILE"] },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const latestLogin = activities.find((activity) => activity.action === "LOGIN");
  const latestLogout = activities.find((activity) => activity.action === "LOGOUT");

  return (
    <main className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3 rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Detail</p>
          <h1 className="mt-1 text-[13px] font-semibold tracking-tight">Informasi Manajer</h1>
        </div>
        <span className="text-xs text-[#6b7280]">{manager.isActive}</span>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-[#e5e7eb] pb-3">
        <a href={`/dashboard/admin/managers/${manager.id}/history`} className="btn">Lihat Histori Berkas</a>
        <a href={`/dashboard/admin/managers/${manager.id}/edit`} className="btn">Edit Manajer</a>
        <form action="/api/admin/managers/action" method="POST">
          <input type="hidden" name="userId" value={manager.id} />
          <input type="hidden" name="action" value={manager.isActive === "ACTIVE" ? "deactivate" : "activate"} />
          <button type="submit" className="btn">{manager.isActive === "ACTIVE" ? "Nonaktifkan" : "Aktifkan"}</button>
        </form>
        <ConfirmActionForm
          action="/api/admin/managers/action"
          confirmMessage="Apakah Anda yakin ingin menghapus manajer ini? Data terkait manajer akan dihapus setelah akun tidak memiliki tim."
        >
          <input type="hidden" name="userId" value={manager.id} />
          <input type="hidden" name="action" value="delete" />
          <button type="submit" className="btn btn-danger">Hapus</button>
        </ConfirmActionForm>
      </div>

      <section className="grid gap-3 rounded-lg border border-[#e5e7eb] bg-white p-4 sm:grid-cols-2">
        <div><p className="text-[11px] text-[#6b7280]">Nama</p><p className="mt-0.5 text-[13px] font-semibold">{manager.name}</p></div>
        <div><p className="text-[11px] text-[#6b7280]">Email</p><p className="mt-0.5 text-[13px] font-semibold">{manager.email}</p></div>
        <div><p className="text-[11px] text-[#6b7280]">Nomor Telepon</p><p className="mt-0.5 text-[13px] font-semibold">{manager.phoneNumber ?? "Belum diisi"}</p></div>
        <div><p className="text-[11px] text-[#6b7280]">Akun dibuat</p><p className="mt-0.5 text-[13px] font-semibold">{new Date(manager.createdAt).toLocaleString("id-ID")}</p></div>
      </section>

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wide">Aktivitas Terakhir</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-[11px] text-[#6b7280]">Login terakhir</p>
            <p className="text-[13px] font-semibold">{latestLogin ? new Date(latestLogin.createdAt).toLocaleString("id-ID") : "Belum ada data"}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#6b7280]">Logout terakhir</p>
            <p className="text-[13px] font-semibold">{latestLogout ? new Date(latestLogout.createdAt).toLocaleString("id-ID") : "Belum ada data"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="mb-3 flex items-center justify-between border-b border-[#e5e7eb] pb-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide">Tim</h2>
          <span className="text-[11px] text-[#6b7280]">{manager.managedTeam?.members.length ?? 0} anggota</span>
        </div>
        {manager.managedTeam ? (
          <>
            <p className="mb-3 text-[13px] text-[#111111]">Nama tim: <strong>{manager.managedTeam.name}</strong></p>
            <div className="divide-y divide-slate-200 border-y border-[#e5e7eb]">
              {manager.managedTeam.members.map((member) => (
                <div key={member.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 py-2 text-[13px]">
                  <span className="truncate font-medium">{member.name}</span>
                  <span className="truncate text-[#6b7280]">{member.email}</span>
                  <span className="text-[11px] text-[#6b7280]">{member.isActive}</span>
                </div>
              ))}
            </div>
          </>
        ) : <p className="text-[13px] text-[#6b7280]">Manajer belum memiliki tim.</p>}
      </section>

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="mb-3 border-b border-[#e5e7eb] pb-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide">Berkas Terbaru Tim</h2>
        </div>
        <div className="divide-y divide-slate-200 border-y border-[#e5e7eb]">
          {manager.managedTeam?.uploads.map((upload) => (
            <div key={upload.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2 text-[13px]">
              <span className="truncate" title={upload.fileName}>{upload.fileName}</span>
              <span className="text-[11px] text-[#6b7280]">{upload.category}</span>
            </div>
          )) ?? <p className="py-4 text-[13px] text-[#6b7280]">Belum ada berkas tim.</p>}
        </div>
      </section>

      <div className="flex justify-end">
        <BackToPreviousButton />
      </div>
    </main>
  );
}
