import Link from "next/link";
import { notFound } from "next/navigation";
import { requireManajer } from "@/lib/auth";
import { PaginationControls } from "@/app/components/pagination-controls";
import { prisma } from "@/lib/prisma";

export default async function ManagerTeamDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; historyPage?: string }>;
}) {
  await requireManajer();
  const [{ id: idParam }, query] = await Promise.all([params, searchParams]);
  const teamId = Number(idParam);
  if (!Number.isInteger(teamId) || teamId <= 0) notFound();
  const period = new Date().toISOString().slice(0, 7);

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: {
      id: true,
      name: true,
      isActive: true,
      createdAt: true,
      department: { select: { id: true, name: true } },
      leader: {
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          isActive: true,
          targets: {
            where: { period },
            select: { id: true, name: true, targetValue: true, currentValue: true },
            orderBy: { name: "asc" },
          },
        },
      },
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          position: true,
          isActive: true,
          targets: {
            where: { period },
            select: { id: true, name: true, targetValue: true, currentValue: true, period: true },
            orderBy: { name: "asc" },
          },
        },
        orderBy: { name: "asc" },
      },
      uploads: {
        select: {
          id: true,
          fileName: true,
          filePath: true,
          category: true,
          status: true,
          isSubmitted: true,
          submissionDate: true,
          createdAt: true,
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!team) notFound();

  const pageSize = 10;
  const historyPageSize = 10;
  const requestedPage = Math.max(1, Number(query.page) || 1);
  const requestedHistoryPage = Math.max(1, Number(query.historyPage) || 1);
  const submittedUploads = team.uploads.filter((upload) => upload.isSubmitted);
  const totalPages = Math.max(1, Math.ceil(team.uploads.length / pageSize));
  const totalHistoryPages = Math.max(1, Math.ceil(submittedUploads.length / historyPageSize));
  const page = Math.min(requestedPage, totalPages);
  const historyPage = Math.min(requestedHistoryPage, totalHistoryPages);
  const latestUploads = team.uploads.slice((page - 1) * pageSize, page * pageSize);
  const historyUploads = submittedUploads.slice((historyPage - 1) * historyPageSize, historyPage * historyPageSize);
  const allTargets = [
    ...team.leader.targets,
    ...team.members.flatMap((member) => member.targets),
  ];
  const targetsByName = new Map<string, { targetValue: number; currentValue: number; count: number }>();
  for (const target of allTargets) {
    const summary = targetsByName.get(target.name) ?? { targetValue: 0, currentValue: 0, count: 0 };
    summary.targetValue += target.targetValue;
    summary.currentValue += target.currentValue;
    summary.count += 1;
    targetsByName.set(target.name, summary);
  }
  const targetRows = Array.from(targetsByName.entries()).map(([name, summary]) => ({ name, ...summary }));
  const targetCount = targetRows.length;
  const targetValueTotal = targetRows.reduce((total, target) => total + target.targetValue, 0);
  const currentValueTotal = targetRows.reduce((total, target) => total + target.currentValue, 0);
  const targetProgress = targetValueTotal > 0 ? Math.round((currentValueTotal / targetValueTotal) * 100) : 0;
  const activeMembers = team.members.filter((member) => member.isActive === "ACTIVE").length;

  return (
    <main className="space-y-4">
      <header className="flex flex-col gap-3 rounded-lg border border-[#e5e7eb] bg-white px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/dashboard/manajer/pengguna?role=TEAM" className="text-[11px] font-medium text-[#1f6c9f] hover:underline">Kembali ke Data Pengguna</Link>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">{team.department.name} · Detail tim</p>
          <h1 className="mt-1 text-[17px] font-semibold">{team.name}</h1>
          <p className="mt-1 text-xs text-[#6b7280]">Dibuat {team.createdAt.toLocaleDateString("id-ID")}</p>
        </div>
        <span className={`inline-flex w-fit rounded px-2.5 py-1 text-[11px] font-medium ${team.isActive ? "bg-[#edf3ec] text-[#346538]" : "bg-[#f3f4f6] text-[#4b5563]"}`}>
          {team.isActive ? "Tim aktif" : "Tim nonaktif"}
        </span>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Anggota", team.members.length],
          ["Anggota aktif", activeMembers],
          ["Target periode ini", targetCount],
          ["Total berkas", team.uploads.length],
          ["Riwayat terkirim", submittedUploads.length],
        ].map(([label, value]) => (
          <div key={label} className="flex min-h-[68px] items-center justify-between gap-3 rounded-md border border-[#e5e7eb] bg-white px-3.5 py-3">
            <span className="text-xs text-[#6b7280]">{label}</span>
            <strong className="text-lg tabular-nums">{value}</strong>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.7fr)]">
        <div className="rounded-md border border-[#e5e7eb] bg-white">
          <h2 className="border-b border-[#e5e7eb] px-4 py-3 text-xs font-semibold uppercase tracking-wide">Ketua Tim</h2>
          <div className="px-4 py-4">
            <p className="text-sm font-semibold">{team.leader.name}</p>
            <p className="mt-1 break-all text-xs text-[#6b7280]">{team.leader.email}</p>
            <p className="mt-1 text-xs text-[#6b7280]">{team.leader.phoneNumber ?? "Nomor telepon belum diisi"}</p>
            <p className="mt-3 text-[11px] text-[#6b7280]">Status akun: {team.leader.isActive}</p>
          </div>
        </div>

        <div className="rounded-md border border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide">Progres Target Periode Ini</h2>
            <span className="text-sm font-semibold tabular-nums">{targetProgress}%</span>
          </div>
          <div className="px-4 py-3 text-xs text-[#6b7280]">
            <p>{currentValueTotal.toLocaleString("id-ID")} dari {targetValueTotal.toLocaleString("id-ID")}</p>
            <div className="mt-2 h-2 overflow-hidden rounded bg-[#e5e7eb]">
              <div className="h-full rounded bg-[#4f8a53]" style={{ width: `${Math.min(targetProgress, 100)}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-[#e5e7eb] bg-white">
        <div className="border-b border-[#e5e7eb] px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Pengguna dalam Tim</h2>
          <p className="mt-1 text-[11px] text-[#6b7280]">{team.members.length} anggota</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead><tr className="border-b border-[#e5e7eb] text-[10px] uppercase tracking-wide text-[#6b7280]"><th className="px-3 py-2 font-semibold">Nama</th><th className="px-3 py-2 font-semibold">Email</th><th className="px-3 py-2 font-semibold">Jabatan</th><th className="px-3 py-2 font-semibold">Status</th></tr></thead>
            <tbody>
              {team.members.map((member) => (
                <tr key={member.id} className="border-b border-[#f1f3f5] last:border-0">
                  <td className="whitespace-nowrap px-3 py-2.5 font-medium">{member.name}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[#6b7280]">{member.email}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{member.position ?? "-"}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{member.isActive}</td>
                </tr>
              ))}
              {team.members.length === 0 && <tr><td colSpan={4} className="px-3 py-7 text-center text-xs text-[#6b7280]">Belum ada anggota pada tim ini.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-[#e5e7eb] bg-white">
        <div className="border-b border-[#e5e7eb] px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Target Pengguna</h2>
          <p className="mt-1 text-[11px] text-[#6b7280]">Periode {period} · nilai digabung dari leader dan anggota tim</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead><tr className="border-b border-[#e5e7eb] text-[10px] uppercase tracking-wide text-[#6b7280]"><th className="px-3 py-2 font-semibold">Target Tim</th><th className="px-3 py-2 font-semibold">Jumlah Pengguna</th><th className="px-3 py-2 font-semibold">Progres Gabungan</th><th className="px-3 py-2 font-semibold">Pencapaian</th></tr></thead>
            <tbody>
              {targetRows.map((target) => {
                const progress = target.targetValue > 0 ? (target.currentValue / target.targetValue) * 100 : 0;
                return <tr key={target.name} className="border-b border-[#f1f3f5] last:border-0"><td className="px-3 py-2.5 font-medium">{target.name}</td><td className="px-3 py-2.5 tabular-nums">{target.count}</td><td className="px-3 py-2.5 text-[#6b7280]">{target.currentValue.toLocaleString("id-ID")} / {target.targetValue.toLocaleString("id-ID")}</td><td className="px-3 py-2.5 font-semibold">{progress.toFixed(1)}%</td></tr>;
              })}
              {targetRows.length === 0 && <tr><td colSpan={4} className="px-3 py-7 text-center text-xs text-[#6b7280]">Belum ada target untuk periode ini.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-[#e5e7eb] bg-white">
        <div className="border-b border-[#e5e7eb] px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Berkas Terbaru</h2>
          <p className="mt-1 text-[11px] text-[#6b7280]">Menampilkan berkas tim, termasuk yang belum dikirim.</p>
        </div>
        <div className="divide-y divide-[#f1f3f5]">
          {latestUploads.map((upload) => (
            <article key={upload.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[1.4fr_1fr_0.8fr_auto] sm:items-center">
              <a href={upload.filePath} target="_blank" rel="noreferrer" className="truncate text-xs font-medium text-[#1f6c9f] hover:underline">{upload.fileName}</a>
              <span className="truncate text-xs">{upload.user.name}</span>
              <span className="text-xs text-[#6b7280]">{upload.category} · {upload.status}</span>
              <time className="text-[11px] text-[#6b7280]">{upload.createdAt.toLocaleString("id-ID")}</time>
            </article>
          ))}
          {latestUploads.length === 0 && <p className="px-4 py-7 text-center text-xs text-[#6b7280]">Belum ada berkas pada tim ini.</p>}
        </div>
        <div className="px-4 pb-3">
          <PaginationControls basePath={`/dashboard/manajer/tim/${team.id}`} page={page} totalItems={team.uploads.length} pageSize={pageSize} query={{ historyPage: historyPage > 1 ? String(historyPage) : undefined }} />
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-[#e5e7eb] bg-white">
        <div className="border-b border-[#e5e7eb] px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Riwayat Berkas Terkirim</h2>
          <p className="mt-1 text-[11px] text-[#6b7280]">Berkas yang sudah dikirim oleh pengguna tim.</p>
        </div>
        <div className="divide-y divide-[#f1f3f5]">
          {historyUploads.map((upload) => (
            <article key={upload.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[1.4fr_1fr_0.8fr_auto] sm:items-center">
              <a href={upload.filePath} target="_blank" rel="noreferrer" className="truncate text-xs font-medium text-[#1f6c9f] hover:underline">{upload.fileName}</a>
              <span className="truncate text-xs">{upload.user.name}</span>
              <span className="text-xs text-[#6b7280]">{upload.category} · {upload.status}</span>
              <time className="text-[11px] text-[#6b7280]">{upload.submissionDate.toLocaleString("id-ID")}</time>
            </article>
          ))}
          {historyUploads.length === 0 && <p className="px-4 py-7 text-center text-xs text-[#6b7280]">Belum ada berkas terkirim.</p>}
        </div>
        <div className="px-4 pb-3">
          <PaginationControls basePath={`/dashboard/manajer/tim/${team.id}`} page={historyPage} totalItems={submittedUploads.length} pageSize={historyPageSize} query={{ page: page > 1 ? String(page) : undefined }} />
        </div>
      </section>
    </main>
  );
}
