import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/auth";
import Link from "next/link";
import { getStartOfCurrentJakartaDay } from "@/lib/upload-time";

export default async function EmployeeDashboardPage() {
  const employee = await requireEmployee();

  if (!employee.teamId) {
    return (
      <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
        <div className="mx-auto max-w-3xl rounded-lg border border-[#e5e7eb] bg-white p-5">
          <h1 className="text-[15px] font-semibold">Dashboard Karyawan</h1>
          <p className="mt-2 text-sm text-[#6b7280]">Anda belum ditugaskan ke tim. Silakan hubungi manajer Anda.</p>
        </div>
      </main>
    );
  }

  const startOfToday = getStartOfCurrentJakartaDay(new Date());
  const activeSince = new Date();
  activeSince.setHours(activeSince.getHours() - 12);

  const [team, myUploads, importantFiles, totalMembers, announcementCount] = await Promise.all([
    prisma.team.findUnique({
      where: { id: employee.teamId },
      include: {
        manager: true,
        announcements: {
          where: { OR: [{ isPinned: true }, { createdAt: { gte: activeSince } }] },
          orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
          take: 4,
        },
      },
    }),
    prisma.upload.findMany({
      where: { userId: employee.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.importantFile.findMany({ where: { userId: employee.id } }),
    prisma.user.count({ where: { teamId: employee.teamId, role: "KARYAWAN" } }),
    prisma.announcement.count({ where: { teamId: employee.teamId, OR: [{ isPinned: true }, { createdAt: { gte: activeSince } }] } }),
  ]);

  if (!team) {
    return (
      <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
        <div className="mx-auto max-w-3xl rounded-lg border border-[#e5e7eb] bg-white p-5">
          <h1 className="text-[15px] font-semibold">Dashboard Karyawan</h1>
          <p className="mt-2 text-sm text-[#6b7280]">Tim tidak tersedia. Hubungi admin.</p>
        </div>
      </main>
    );
  }

  const todayUploads = myUploads.filter((u) => u.submissionDate >= startOfToday);
  const byCategory = new Map(todayUploads.map((u) => [u.category, u]));
  const categories = ["DATA_A", "DATA_B", "DATA_C"] as const;
  const submittedCount = categories.filter((c) => {
    const u = byCategory.get(c);
    return u?.isSubmitted;
  }).length;

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[15px] font-semibold tracking-tight">Halo, {employee.name.split(" ")[0]}</h1>
            <span className="rounded-md bg-[#e1f3fe] px-2 py-1 text-xs font-medium text-[#1f6c9f]">{team.name}</span>
          </div>
          <p className="mt-0.5 text-xs text-[#6b7280]">Berikut ringkasan aktivitas hari ini.</p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => {
            const u = byCategory.get(cat);
            const label = cat.replace("DATA_", "Data ");
            return (
              <div key={cat} className="rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#6b7280]">{label}</p>
                {u ? (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`inline-block h-2 w-2 rounded-full ${u.isSubmitted ? "bg-[#346538]" : "bg-[#956400]"}`} />
                    <p className="text-[13px] font-semibold">{u.isSubmitted ? "Terkirim" : "Menunggu"}</p>
                  </div>
                ) : (
                  <p className="mt-1.5 text-[13px] font-semibold text-[#9ca3af]">Belum upload</p>
                )}
                {u && <p className="mt-0.5 truncate text-xs text-[#6b7280]">{u.fileName}</p>}
              </div>
            );
          })}
          <div className="rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#6b7280]">Data Penting</p>
            <p className="mt-1.5 text-[13px] font-semibold">{importantFiles.length} file</p>
            <p className="mt-0.5 text-xs text-[#6b7280]">Tersimpan permanen</p>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/karyawan/berkas" className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 transition hover:border-[#2563eb]">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#6b7280]">Berkas</p>
              <p className="mt-1 text-[15px] font-semibold">Kirim & Lihat</p>
            </div>
            <span className="text-lg text-[#9ca3af]">→</span>
          </Link>
          <Link href="/dashboard/karyawan/data-penting" className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 transition hover:border-[#2563eb]">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#6b7280]">Data Penting</p>
              <p className="mt-1 text-[15px] font-semibold">Kelola File</p>
            </div>
            <span className="text-lg text-[#9ca3af]">→</span>
          </Link>
          <Link href="/dashboard/karyawan/pengumuman" className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 transition hover:border-[#2563eb]">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#6b7280]">Pengumuman</p>
              <p className="mt-1 text-[15px] font-semibold">{announcementCount} Terbaru</p>
            </div>
            <span className="text-lg text-[#9ca3af]">→</span>
          </Link>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-lg border border-[#e5e7eb] bg-white">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide">Status Hari Ini</h2>
              <span className="rounded-md bg-[#e1f3fe] px-2 py-0.5 text-[11px] font-medium text-[#1f6c9f]">{submittedCount}/3</span>
            </div>
            <div className="divide-y divide-[#f1f3f5]">
              {categories.map((cat) => {
                const u = byCategory.get(cat);
                return (
                  <div key={cat} className="flex items-center justify-between px-4 py-2.5">
                    <p className="text-[13px] font-medium">{cat.replace("DATA_", "Data ")}</p>
                    {u?.isSubmitted ? (
                      <span className="rounded bg-[#edf3ec] px-1.5 py-0.5 text-[11px] font-medium text-[#346538]">✓ Terkirim</span>
                    ) : (
                      <span className="rounded bg-[#fbf3db] px-1.5 py-0.5 text-[11px] font-medium text-[#956400]">⏳ Belum</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="border-t border-[#e5e7eb] px-4 py-2">
              <Link href="/dashboard/karyawan/berkas" className="text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8]">Kirim berkas →</Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-[#e5e7eb] bg-white">
              <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide">Pengumuman</h2>
                <Link href="/dashboard/karyawan/pengumuman" className="text-[11px] font-semibold text-[#2563eb]">Lihat semua →</Link>
              </div>
              <div className="divide-y divide-[#f1f3f5]">
                {team.announcements.length > 0 ? team.announcements.map((a) => (
                  <div key={a.id} className="px-4 py-2.5">
                    <p className="line-clamp-2 text-[13px] leading-snug">{a.content}</p>
                    <p className="mt-1 text-[11px] text-[#9ca3af]">{new Date(a.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}</p>
                  </div>
                )) : <p className="px-4 py-6 text-center text-xs text-[#6b7280]">Belum ada pengumuman.</p>}
              </div>
            </div>

            <div className="rounded-lg border border-[#e5e7eb] bg-white">
              <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide">Manajer Tim</h2>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-[11px] font-semibold text-white">{team.manager.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}</span>
                <div>
                  <p className="text-[13px] font-medium">{team.manager.name}</p>
                  <p className="text-xs text-[#6b7280]">{team.manager.email}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
