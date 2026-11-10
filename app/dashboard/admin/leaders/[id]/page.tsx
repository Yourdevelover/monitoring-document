import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ConfirmActionForm } from "@/app/components/confirm-action-form";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";

type LeaderDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminLeaderDetailPage({ params }: LeaderDetailProps) {
  await requireAdmin();
  const { id } = await params;
  const leader = await prisma.user.findFirst({
    where: { id: Number(id), role: "LEADER" },
    include: {
      ledTeam: {
        include: {
          department: true,
          members: { orderBy: { createdAt: "desc" } },
          uploads: { orderBy: { createdAt: "desc" }, take: 10 },
        },
      },
    },
  });

  if (!leader) notFound();

  const activities = await prisma.activityLog.findMany({
    where: {
      actorId: leader.id,
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
          <h1 className="mt-1 text-[13px] font-semibold tracking-tight">Informasi Leader</h1>
        </div>
        <span className="text-xs text-[#6b7280]">{leader.isActive}</span>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-[#e5e7eb] pb-3">
        <a href={`/dashboard/admin/leaders/${leader.id}/history`} className="btn">Lihat Histori Berkas</a>
        <a href={`/dashboard/admin/leaders/${leader.id}/edit`} className="btn">Edit Leader</a>
        {leader.isActive === "PENDING" ? (
          <>
            <ConfirmActionForm action="/api/admin/leaders/action" confirmMessage="Setujui pendaftaran leader ini? Akun dan timnya akan diaktifkan.">
              <input type="hidden" name="userId" value={leader.id} />
              <input type="hidden" name="action" value="approve" />
              <button type="submit" className="btn">Setujui Leader</button>
            </ConfirmActionForm>
            <ConfirmActionForm action="/api/admin/leaders/action" confirmMessage="Tolak pendaftaran leader ini? Akunnya tidak akan dapat digunakan.">
              <input type="hidden" name="userId" value={leader.id} />
              <input type="hidden" name="action" value="reject" />
              <button type="submit" className="btn btn-danger">Tolak</button>
            </ConfirmActionForm>
          </>
        ) : (
          <form action="/api/admin/leaders/action" method="POST">
            <input type="hidden" name="userId" value={leader.id} />
            <input type="hidden" name="action" value={leader.isActive === "ACTIVE" ? "deactivate" : "activate"} />
            <button type="submit" className="btn">{leader.isActive === "ACTIVE" ? "Nonaktifkan" : "Aktifkan"}</button>
          </form>
        )}
        <ConfirmActionForm
          action="/api/admin/leaders/action"
          confirmMessage="Apakah Anda yakin ingin menghapus leader ini? Data terkait leader akan dihapus setelah akun tidak memiliki tim."
        >
          <input type="hidden" name="userId" value={leader.id} />
          <input type="hidden" name="action" value="delete" />
          <button type="submit" className="btn btn-danger">Hapus</button>
        </ConfirmActionForm>
      </div>

      <section className="grid gap-3 rounded-lg border border-[#e5e7eb] bg-white p-4 sm:grid-cols-2">
        <div><p className="text-[11px] text-[#6b7280]">Nama</p><p className="mt-0.5 text-[13px] font-semibold">{leader.name}</p></div>
        <div><p className="text-[11px] text-[#6b7280]">Email</p><p className="mt-0.5 text-[13px] font-semibold">{leader.email}</p></div>
        <div><p className="text-[11px] text-[#6b7280]">Nomor Telepon</p><p className="mt-0.5 text-[13px] font-semibold">{leader.phoneNumber ?? "Belum diisi"}</p></div>
        <div><p className="text-[11px] text-[#6b7280]">Akun dibuat</p><p className="mt-0.5 text-[13px] font-semibold">{new Date(leader.createdAt).toLocaleString("id-ID")}</p></div>
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
          <span className="text-[11px] text-[#6b7280]">{leader.ledTeam?.members.length ?? 0} anggota</span>
        </div>
        {leader.ledTeam ? (
          <>
            <p className="mb-3 text-[13px] text-[#111111]">Nama tim: <strong>{leader.ledTeam.name}</strong></p>
            <p className="mb-3 text-[13px] text-[#111111]">Departemen: <strong>{leader.ledTeam.department.name}</strong></p>
            <div className="divide-y divide-slate-200 border-y border-[#e5e7eb]">
              {leader.ledTeam.members.map((member) => (
                <div key={member.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 py-2 text-[13px]">
                  <span className="truncate font-medium">{member.name}</span>
                  <span className="truncate text-[#6b7280]">{member.email}</span>
                  <span className="text-[11px] text-[#6b7280]">{member.isActive}</span>
                </div>
              ))}
            </div>
          </>
        ) : <p className="text-[13px] text-[#6b7280]">Leader belum memiliki tim.</p>}
      </section>

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="mb-3 border-b border-[#e5e7eb] pb-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide">Berkas Terbaru Tim</h2>
        </div>
        <div className="divide-y divide-slate-200 border-y border-[#e5e7eb]">
          {leader.ledTeam?.uploads.map((upload) => (
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
