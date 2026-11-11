import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";

type ManagerDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminManagerDetailPage({ params }: ManagerDetailProps) {
  await requireAdmin();
  const { id } = await params;
  const leader = await prisma.user.findFirst({
    where: { id: Number(id), role: "MANAJER" },
    include: {
      department: true,
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
  const recentFiles = leader.departmentId
    ? await prisma.upload.findMany({
        where: { team: { departmentId: leader.departmentId } },
        include: { user: true, team: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    : [];
  const latestLogin = activities.find((activity) => activity.action === "LOGIN");
  const latestLogout = activities.find((activity) => activity.action === "LOGOUT");

  return (
    <main className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-[#e5e7eb] pb-3">
        <a href={`/dashboard/admin/managers/${leader.id}/edit`} className="btn">Edit Manajer</a>
        <form action="/api/admin/managers/action" method="POST">
          <input type="hidden" name="userId" value={leader.id} />
          <input type="hidden" name="action" value={leader.isActive === "ACTIVE" ? "deactivate" : "activate"} />
          <button type="submit" className="btn">{leader.isActive === "ACTIVE" ? "Nonaktifkan" : "Aktifkan"}</button>
        </form>
      </div>

      <section className="overflow-hidden rounded-lg border border-[#e1e5e9] bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e9ecef] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e8f0fd] text-sm font-semibold text-[#2866b1]">
              {leader.name.trim().charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">Profil Manajer</p>
              <h1 className="mt-0.5 break-words text-base font-semibold text-[#111111]">{leader.name}</h1>
            </div>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${leader.isActive === "ACTIVE" ? "bg-[#edf3ec] text-[#346538]" : "bg-[#f3f4f6] text-[#6b7280]"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${leader.isActive === "ACTIVE" ? "bg-[#4f8a53]" : "bg-[#9ca3af]"}`} />
            {leader.isActive === "ACTIVE" ? "Aktif" : "Nonaktif"}
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
                ["Departemen", leader.department?.name ?? "Belum diatur"],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 border-b border-[#f1f3f5] py-3">
                  <dt className="text-xs text-[#111111]">{label}</dt>
                  <dd className={`break-words text-left text-xs font-medium ${value === "Belum diisi" || value === "Belum diatur" ? "text-[#9ca3af]" : "text-[#111111]"}`}>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

      <section className="mx-5 mb-4 overflow-hidden rounded-md border border-[#e5e7eb]">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-[#fbfcfd] px-4 py-3">
          <h2 className="text-xs font-semibold text-[#263238]">Berkas Terbaru Departemen</h2>
          <span className="text-[11px] text-[#6b7280]">{recentFiles.length} file</span>
        </div>
        <div className="divide-y divide-[#f1f3f5] px-4">
          {recentFiles.map((upload) => (
            <a key={upload.id} href={upload.filePath} target="_blank" rel="noreferrer" className="grid gap-1 py-3 hover:bg-[#f8f9fa] sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
              <span className="truncate text-xs font-medium" title={upload.fileName}>{upload.fileName}</span>
              <span className="text-[11px] text-[#6b7280]">{upload.user.name} · {upload.category}</span>
              <time className="text-[11px] text-[#6b7280]">{upload.createdAt.toLocaleString("id-ID")}</time>
            </a>
          ))}
          {recentFiles.length === 0 && <p className="py-4 text-xs text-[#6b7280]">Belum ada berkas di departemen ini.</p>}
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
