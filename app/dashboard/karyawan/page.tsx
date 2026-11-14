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
          <p className="mt-2 text-sm text-[#6b7280]">Anda belum ditugaskan ke tim. Silakan hubungi leader Anda.</p>
        </div>
      </main>
    );
  }

  const startOfToday = getStartOfCurrentJakartaDay(new Date());
  const currentPeriod = new Date().toISOString().slice(0, 7);
  const activeSince = new Date();
  activeSince.setHours(activeSince.getHours() - 12);

  const [team, myUploads, importantFileCount, announcementCount, myTargets] = await Promise.all([
    prisma.team.findUnique({
      where: { id: employee.teamId },
      include: {
        leader: true,
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
    prisma.upload.count({ where: { userId: employee.id, importantSaved: true } }),
    prisma.announcement.count({ where: { teamId: employee.teamId, OR: [{ isPinned: true }, { createdAt: { gte: activeSince } }] } }),
    prisma.target.findMany({ where: { userId: employee.id, period: currentPeriod }, orderBy: { updatedAt: "desc" } }),
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
  const categories = ["DAILY", "CHAT", "PAYMENT"] as const;
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
            const label = cat.toLowerCase();
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
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#6b7280]">Data Prioritas</p>
            <p className="mt-1.5 text-[13px] font-semibold">{importantFileCount} file</p>
            <p className="mt-0.5 text-xs text-[#6b7280]">Tersimpan permanen</p>
          </div>
        </section>

        <section className="rounded-lg border border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-[#e5e7eb] px-4 py-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide">Target Bulan Ini</h2>
              <p className="mt-0.5 text-[11px] text-[#6b7280]">Progres pribadi periode {currentPeriod}</p>
            </div>
            <Link href="/dashboard/karyawan/target" className="shrink-0 text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8]">
              Kelola target →
            </Link>
          </div>
          {myTargets.length > 0 ? (
            <div className="divide-y divide-[#f1f3f5]">
              {myTargets.map((target) => {
                const percentage = target.targetValue > 0
                  ? (target.currentValue / target.targetValue) * 100
                  : 0;
                const reached = percentage >= 100;

                return (
                  <div key={target.id} className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[13px] font-medium">{target.name}</p>
                      <p className={`text-xs font-semibold tabular-nums ${reached ? "text-[#346538]" : "text-[#956400]"}`}>
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div
                        className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#f1f3f5]"
                        role="progressbar"
                        aria-label={`Progres ${target.name}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.min(100, Math.max(0, percentage))}
                      >
                        <div
                          className={`h-full rounded-full ${reached ? "bg-[#346538]" : "bg-[#956400]"}`}
                          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                        />
                      </div>
                      <p className="shrink-0 text-[11px] tabular-nums text-[#6b7280]">
                        {target.currentValue.toLocaleString("id-ID")} / {target.targetValue.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-5 text-sm text-[#6b7280]">
              Belum ada target untuk bulan ini. <Link href="/dashboard/karyawan/target" className="font-medium text-[#2563eb] hover:underline">Buat target</Link>
            </div>
          )}
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/karyawan/berkas" className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 transition hover:border-[#2563eb]">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#6b7280]">Berkas</p>
              <p className="mt-1 text-[15px] font-semibold">Kirim & Lihat</p>
            </div>
            <span className="text-lg text-[#9ca3af]">→</span>
          </Link>
          <Link href="/dashboard/karyawan/data-prioritas" className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 transition hover:border-[#2563eb]">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#6b7280]">Data Prioritas</p>
              <p className="mt-1 text-[15px] font-semibold">Kelola File</p>
            </div>
            <span className="text-lg text-[#9ca3af]">→</span>
          </Link>
          <Link href="/dashboard/karyawan/announcement" className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 transition hover:border-[#2563eb]">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#6b7280]">Announcement</p>
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
                    <p className="text-[13px] font-medium">{cat.toLowerCase()}</p>
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
                <h2 className="text-xs font-semibold uppercase tracking-wide">Announcement</h2>
                <Link href="/dashboard/karyawan/announcement" className="text-[11px] font-semibold text-[#2563eb]">Lihat semua →</Link>
              </div>
              <div className="divide-y divide-[#f1f3f5]">
                {team.announcements.length > 0 ? team.announcements.map((a) => (
                  <div key={a.id} className="px-4 py-2.5">
                    <p className="line-clamp-2 text-[13px] leading-snug">{a.content}</p>
                    <p className="mt-1 text-[11px] text-[#9ca3af]">{new Date(a.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}</p>
                  </div>
                )) : <p className="px-4 py-6 text-center text-xs text-[#6b7280]">Belum ada announcement.</p>}
              </div>
            </div>

            <div className="rounded-lg border border-[#e5e7eb] bg-white">
              <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide">Leader Tim</h2>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-[11px] font-semibold text-white">{team.leader.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}</span>
                <div>
                  <p className="text-[13px] font-medium">{team.leader.name}</p>
                  <p className="text-xs text-[#6b7280]">{team.leader.email}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
