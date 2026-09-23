import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/auth";
import { PaginationControls } from "@/app/components/pagination-controls";
import Link from "next/link";

export default async function ManagerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const manager = await requireManager();
  const params = await searchParams;
  const pageSize = 6;
  const requestedPage = Math.max(1, Number(params.page) || 1);

  const team = await prisma.team.findUnique({
    where: { managerId: manager.id },
    include: {
      manager: true,
      uploads: {
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          user: true,
        },
      },
      announcements: {
        orderBy: { createdAt: "desc" },
        take: 6,
      },
    },
  });

  if (!team) {
    return (
      <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-5">
          <h1 className="text-base font-bold">Dashboard Manajer</h1>
          <p className="mt-3 text-[#6b7280]">
            Tim Anda belum tersedia. Silakan buat data tim melalui proses pendaftaran manajer.
          </p>
        </div>
      </main>
    );
  }

  const period = new Date().toISOString().slice(0, 7);
  const activeSince = new Date();
  activeSince.setHours(activeSince.getHours() - 12);

  const [members, teamTargets, pendingRequests, announcementCount, uploadCount] = await Promise.all([
    prisma.user.findMany({ where: { teamId: team.id, role: "KARYAWAN" }, orderBy: { createdAt: "desc" } }),
    prisma.target.findMany({ where: { period, user: { teamId: team.id } }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.profileRequest.count({ where: { user: { teamId: team.id }, status: "PENDING" } }),
    prisma.announcement.count({ where: { teamId: team.id, OR: [{ isPinned: true }, { createdAt: { gte: activeSince } }] } }),
    prisma.upload.count({ where: { teamId: team.id } }),
  ]);

  const totalEmployees = members.length;
  const activeEmployees = members.filter((m) => m.isActive === "ACTIVE").length;

  const memberAgg = new Map<number, { cur: number; tgt: number; count: number }>();
  for (const t of teamTargets) {
    const a = memberAgg.get(t.userId) ?? { cur: 0, tgt: 0, count: 0 };
    a.cur += t.currentValue;
    a.tgt += t.targetValue;
    a.count++;
    memberAgg.set(t.userId, a);
  }

  const memberRows = members.map((m) => {
    const a = memberAgg.get(m.id);
    const pct = a && a.tgt > 0 ? Math.round((a.cur / a.tgt) * 100) : 0;
    return { id: m.id, name: m.name, email: m.email, isActive: m.isActive, pct, targetCount: a?.count ?? 0 };
  });

  const top8 = [...memberRows].sort((a, b) => b.pct - a.pct).slice(0, 8);
  const reachedList = memberRows.filter((m) => m.pct >= 100);
  const notReachedList = memberRows.filter((m) => m.targetCount > 0 && m.pct < 100);
  const noTargetList = memberRows.filter((m) => m.targetCount === 0);

  const targetCount = teamTargets.length;
  const targetReached = teamTargets.filter((t) => t.targetValue > 0 && (t.currentValue / t.targetValue) * 100 >= 100).length;
  const targetAvg = targetCount ? Math.round(teamTargets.reduce((s, t) => s + (t.targetValue > 0 ? (t.currentValue / t.targetValue) * 100 : 0), 0) / targetCount) : 0;

  const totalPages = Math.max(1, Math.ceil(totalEmployees / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const pageMembers = memberRows.slice((page - 1) * pageSize, page * pageSize);

  const summary = {
    totalEmployees,
    activeEmployees,
    totalUploads: uploadCount,
    totalAnnouncements: announcementCount,
    pendingProfileRequests: pendingRequests,
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="flex flex-col gap-3 rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Ringkasan Tim</p>
            <h1 className="mt-1 text-[15px] font-semibold tracking-tight">Dashboard Manajer</h1>
            <p className="mt-0.5 text-xs text-[#6b7280]">{manager.name} • {team.name}</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-md bg-[#e1f3fe] px-2.5 py-1.5 font-medium text-[#1f6c9f]">{summary.totalEmployees} karyawan</span>
            <span className="rounded-md bg-[#fbf3db] px-2.5 py-1.5 font-medium text-[#956400]">{summary.pendingProfileRequests} pending</span>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[["Karyawan", summary.totalEmployees, "bg-[#e1f3fe] text-[#1f6c9f]", "/dashboard/manajer/karyawan"], ["Karyawan Aktif", summary.activeEmployees, "bg-[#edf3ec] text-[#346538]", "/dashboard/manajer/karyawan"], ["File Tim", summary.totalUploads, "bg-[#f1f3f5] text-[#111111]", "/dashboard/manajer/berkas"], ["Pengumuman", summary.totalAnnouncements, "bg-[#fbf3db] text-[#956400]", "/dashboard/manajer/pengumuman"], ["Profil Pending", summary.pendingProfileRequests, "bg-[#fdebec] text-[#9f2f2d]", "/dashboard/manajer/pengajuan-profil"]].map(([label, value, tone, href]) => (
            <Link key={label as string} href={href as string} className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-3 transition hover:border-[#111111] hover:shadow-sm">
              <div><p className="text-[11px] font-medium uppercase tracking-wide text-[#6b7280]">{label}</p><p className="mt-1 text-[15px] font-semibold">{value}</p></div>
              <span className={`flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-bold ${tone}`}>{value}</span>
            </Link>
          ))}
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Target Aktif", value: targetCount, accent: "bg-[#e1f3fe] text-[#1f6c9f]", href: "/dashboard/manajer/target" },
            { label: "Tercapai (100%)", value: targetReached, accent: "bg-[#edf3ec] text-[#346538]", href: "/dashboard/manajer/target" },
            { label: "Rata-rata", value: `${targetAvg}%`, accent: "bg-[#fbf3db] text-[#956400]", href: "/dashboard/manajer/target" },
          ].map((card) => (
            <Link key={card.label} href={card.href} className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-3 transition hover:border-[#111111] hover:shadow-sm">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#6b7280]">{card.label}</p>
                <p className="mt-1 text-[15px] font-semibold tracking-tight">{card.value}</p>
              </div>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${card.accent}`}>{typeof card.value === "string" ? "%" : card.value}</span>
            </Link>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide">Top 8 Karyawan Terbaik</h2>
            {top8.length ? (
              <div className="space-y-2">
                {top8.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${i === 0 ? "bg-[#fbf3db] text-[#956400]" : i === 1 ? "bg-[#f1f3f5] text-[#6b7280]" : "bg-[#fdebec] text-[#9f2f2d]"}`}>{i + 1}</span>
                    <p className="flex-1 truncate text-[12px] font-medium">{m.name}</p>
                    <div className="h-3 w-24 flex-shrink-0 rounded bg-[#f1f3f5]">
                      <div className={`h-full rounded ${m.pct >= 100 ? "bg-[#346538]" : "bg-[#956400]"}`} style={{ width: `${Math.min(100, m.pct)}%` }} />
                    </div>
                    <p className={`w-10 text-right text-[11px] font-semibold ${m.pct >= 100 ? "text-[#346538]" : "text-[#956400]"}`}>{m.pct}%</p>
                  </div>
                ))}
              </div>
            ) : <p className="py-4 text-center text-xs text-[#6b7280]">Belum ada data target.</p>}
          </div>
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide">Info Tim</h2>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between rounded-md bg-[#f8f9fa] px-3 py-2"><dt className="text-[#6b7280]">Nama Tim</dt><dd className="font-semibold">{team.name}</dd></div>
              <div className="flex justify-between rounded-md bg-[#f8f9fa] px-3 py-2"><dt className="text-[#6b7280]">Manajer</dt><dd className="font-semibold">{team.manager.name}</dd></div>
              <div className="flex justify-between rounded-md bg-[#f8f9fa] px-3 py-2"><dt className="text-[#6b7280]">Anggota</dt><dd className="font-semibold">{totalEmployees} orang</dd></div>
              <div className="flex justify-between rounded-md bg-[#f8f9fa] px-3 py-2"><dt className="text-[#6b7280]">Aktif</dt><dd className="font-semibold">{activeEmployees} orang</dd></div>
              <div className="flex justify-between rounded-md bg-[#f8f9fa] px-3 py-2"><dt className="text-[#6b7280]">Dibuat</dt><dd className="font-semibold">{new Date(team.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}</dd></div>
            </dl>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#346538]">✓ Capai 100%</h2>
            {reachedList.length ? (
              <ul className="space-y-1.5">
                {reachedList.map((m) => (
                  <li key={m.id} className="flex items-center justify-between text-[12px]"><span className="truncate font-medium">{m.name}</span><span className="font-semibold text-[#346538]">{m.pct}%</span></li>
                ))}
              </ul>
            ) : <p className="py-3 text-center text-xs text-[#6b7280]">Belum ada.</p>}
          </div>
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#956400]">Belum 100%</h2>
            {notReachedList.length ? (
              <ul className="space-y-1.5">
                {notReachedList.map((m) => (
                  <li key={m.id} className="flex items-center justify-between text-[12px]"><span className="truncate font-medium">{m.name}</span><span className="font-semibold text-[#956400]">{m.pct}%</span></li>
                ))}
              </ul>
            ) : <p className="py-3 text-center text-xs text-[#6b7280]">Semua sudah 100%.</p>}
          </div>
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Belum Punya Target</h2>
            {noTargetList.length ? (
              <ul className="space-y-1.5">
                {noTargetList.map((m) => (
                  <li key={m.id} className="truncate text-[12px] font-medium">{m.name}</li>
                ))}
              </ul>
            ) : <p className="py-3 text-center text-xs text-[#6b7280]">Semua punya target.</p>}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-[#e5e7eb] bg-white">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide">Anggota Tim</h2>
              <span className="text-[11px] text-[#6b7280]">{totalEmployees} orang</span>
            </div>
            <div className="divide-y divide-[#f1f3f5]">
              {pageMembers.length ? pageMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#111111] text-[10px] font-semibold text-white">{member.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}</span>
                    <div className="min-w-0"><p className="truncate text-[13px] font-medium">{member.name}</p><p className="truncate text-xs text-[#6b7280]">{member.email}</p></div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${member.pct >= 100 ? "bg-[#edf3ec] text-[#346538]" : member.targetCount > 0 ? "bg-[#fbf3db] text-[#956400]" : "bg-[#f1f3f5] text-[#6b7280]"}`}>{member.targetCount > 0 ? `${member.pct}%` : "No target"}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${member.isActive === "ACTIVE" ? "bg-[#edf3ec] text-[#346538]" : "bg-[#fdebec] text-[#9f2f2d]"}`}>{member.isActive === "ACTIVE" ? "Aktif" : "Nonaktif"}</span>
                  </div>
                </div>
              )) : <p className="px-4 py-6 text-center text-xs text-[#6b7280]">Belum ada anggota.</p>}
            </div>
            <div className="border-t border-[#e5e7eb] px-4 py-2.5"><PaginationControls basePath="/dashboard/manajer" page={page} totalItems={totalEmployees} /></div>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border border-[#e5e7eb] bg-white">
              <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide">File Terbaru</h2>
                <span className="text-[11px] text-[#6b7280]">{team.uploads.length} file</span>
              </div>
              <div className="divide-y divide-[#f1f3f5]">
                {team.uploads.length ? team.uploads.map((upload) => (
                  <div key={upload.id} className="px-4 py-2.5">
                    <p className="truncate text-[13px] font-medium">{upload.title}</p>
                    <p className="mt-0.5 text-xs text-[#6b7280]">{upload.category} • {upload.user.name}</p>
                  </div>
                )) : <p className="px-4 py-6 text-center text-xs text-[#6b7280]">Belum ada file.</p>}
              </div>
            </div>
            <div className="rounded-lg border border-[#e5e7eb] bg-white">
              <div className="border-b border-[#e5e7eb] px-4 py-3"><h2 className="text-xs font-semibold uppercase tracking-wide">Pengumuman</h2></div>
              <div className="divide-y divide-[#f1f3f5]">
                {team.announcements.length ? team.announcements.slice(0, 3).map((a) => (
                  <div key={a.id} className="px-4 py-2.5"><p className="line-clamp-2 text-[13px] leading-snug">{a.content}</p><p className="mt-1 text-[11px] text-[#9ca3af]">{new Date(a.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}</p></div>
                )) : <p className="px-4 py-6 text-center text-xs text-[#6b7280]">Belum ada pengumuman.</p>}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
