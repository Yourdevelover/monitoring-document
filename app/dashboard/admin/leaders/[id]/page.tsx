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
      <div className="flex flex-wrap gap-2 border-b border-[#e5e7eb] pb-3">
        <a href={`/dashboard/admin/leaders/${leader.id}/history`} className="btn">Lihat Histori Berkas</a>
        {leader.ledTeam && <a href={`/dashboard/admin/leaders/${leader.id}/members`} className="btn">Kelola Anggota Tim</a>}
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
          confirmMessage="Leader hanya bisa dihapus jika semua karyawan sudah dipindahkan atau dihapus. Jika tim kosong, data tim dan berkas terkait akan dihapus."
        >
          <input type="hidden" name="userId" value={leader.id} />
          <input type="hidden" name="action" value="delete" />
          <button type="submit" className="btn btn-danger">Hapus</button>
        </ConfirmActionForm>
      </div>

      <section className="overflow-hidden rounded-lg border border-[#e1e5e9] bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e9ecef] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e8f0fd] text-sm font-semibold text-[#2866b1]">
              {leader.name.trim().charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">Profil Leader</p>
              <h1 className="mt-0.5 break-words text-base font-semibold text-[#111111]">{leader.name}</h1>
            </div>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${leader.isActive === "ACTIVE" ? "bg-[#edf3ec] text-[#346538]" : leader.isActive === "PENDING" ? "bg-[#fff4dd] text-[#8a5a00]" : leader.isActive === "REJECTED" ? "bg-[#fdebec] text-[#9f2f2d]" : "bg-[#f3f4f6] text-[#6b7280]"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${leader.isActive === "ACTIVE" ? "bg-[#4f8a53]" : leader.isActive === "PENDING" ? "bg-[#c0841a]" : leader.isActive === "REJECTED" ? "bg-[#c1423c]" : "bg-[#9ca3af]"}`} />
            {leader.isActive === "ACTIVE" ? "Aktif" : leader.isActive === "PENDING" ? "Menunggu persetujuan" : leader.isActive === "REJECTED" ? "Ditolak" : "Nonaktif"}
          </span>
        </header>
        <div className="px-5 py-4">
          <section className="overflow-hidden rounded-md border border-[#e5e7eb]">
            <h2 className="border-b border-[#e5e7eb] bg-[#fbfcfd] px-4 py-3 text-xs font-semibold text-[#263238]">Detail Personal</h2>
            <dl className="grid gap-x-8 px-4 lg:grid-cols-2">
              {[
                ["Email", leader.email],
                ["Nomor telepon", leader.phoneNumber ?? "Belum diisi"],
                ["NIK", leader.nik ?? "Belum diisi"],
                ["Alamat", leader.address ?? "Belum diisi"],
                ["Akun dibuat", new Date(leader.createdAt).toLocaleString("id-ID")],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 border-b border-[#f1f3f5] py-3">
                  <dt className="text-xs text-[#111111]">{label}</dt>
                  <dd className={`break-words text-left text-xs font-medium ${value === "Belum diisi" ? "text-[#9ca3af]" : "text-[#111111]"}`}>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

      <section className="mx-5 mb-4 overflow-hidden rounded-md border border-[#e5e7eb]">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-[#fbfcfd] px-4 py-3">
          <h2 className="text-xs font-semibold text-[#263238]">Berkas Terbaru Tim</h2>
          <span className="text-[11px] text-[#6b7280]">{leader.ledTeam?.uploads.length ?? 0} file</span>
        </div>
        <div className="divide-y divide-[#f1f3f5] px-4">
          {leader.ledTeam && leader.ledTeam.uploads.length > 0 ? leader.ledTeam.uploads.map((upload) => (
            <div key={upload.id} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-3">
              <span className="truncate text-xs" title={upload.fileName}>{upload.fileName}</span>
              <span className="text-[11px] text-[#6b7280]">{upload.category}</span>
            </div>
          )) : <p className="py-4 text-xs text-[#6b7280]">Belum ada berkas tim.</p>}
        </div>
      </section>

      <section className="mx-5 mb-5 overflow-hidden rounded-md border border-[#e5e7eb]">
        <h2 className="border-b border-[#e5e7eb] bg-[#fbfcfd] px-4 py-3 text-xs font-semibold text-[#263238]">Aktivitas Akun Terakhir</h2>
        <dl className="grid gap-x-6 gap-y-3 px-4 py-4 sm:grid-cols-2">
          <div className="border-l-2 border-[#5c8f68] pl-3">
            <dt className="text-[11px] text-[#6b7280]">Login terakhir</dt>
            <dd className="mt-1 text-xs font-medium tabular-nums text-[#111111]">{latestLogin ? new Date(latestLogin.createdAt).toLocaleString("id-ID") : "Belum ada data"}</dd>
          </div>
          <div className="border-l-2 border-[#c7ced3] pl-3">
            <dt className="text-[11px] text-[#6b7280]">Logout terakhir</dt>
            <dd className="mt-1 text-xs font-medium tabular-nums text-[#111111]">{latestLogout ? new Date(latestLogout.createdAt).toLocaleString("id-ID") : "Belum ada data"}</dd>
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
