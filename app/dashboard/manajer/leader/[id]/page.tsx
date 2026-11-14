import Link from "next/link";
import { notFound } from "next/navigation";
import { requireManajer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ManagerLeaderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireManajer();
  const { id } = await params;
  const leaderId = Number(id);
  if (!Number.isInteger(leaderId) || leaderId <= 0) notFound();

  const leader = await prisma.user.findFirst({
    where: { id: leaderId, role: "LEADER" },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      isActive: true,
      department: { select: { name: true } },
      ledTeam: {
        select: {
          id: true,
          name: true,
          isActive: true,
          department: { select: { name: true } },
          members: {
            select: {
              id: true,
              name: true,
              email: true,
              position: true,
              isActive: true,
            },
            orderBy: { name: "asc" },
          },
          uploads: {
            select: {
              id: true,
              fileName: true,
              filePath: true,
              category: true,
              isSubmitted: true,
              submissionDate: true,
              createdAt: true,
              user: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      },
      targets: {
        where: { period: new Date().toISOString().slice(0, 7) },
        select: { id: true, name: true, targetValue: true, currentValue: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!leader) notFound();

  const currentTarget = leader.targets.reduce((sum, target) => sum + target.targetValue, 0);
  const currentProgress = leader.targets.reduce((sum, target) => sum + target.currentValue, 0);
  const targetPercent = currentTarget > 0 ? Math.round((currentProgress / currentTarget) * 100) : 0;
  const submittedUploads = leader.ledTeam?.uploads.filter((upload) => upload.isSubmitted) ?? [];

  return (
    <main className="space-y-4">
      <header className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-4">
        <Link href="/dashboard/manajer/pengguna?role=LEADER" className="text-[11px] font-medium text-[#1f6c9f] hover:underline">Kembali ke Data Pengguna</Link>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Informasi Leader</p>
        <h1 className="mt-1 text-[16px] font-semibold">{leader.name}</h1>
        <p className="mt-1 text-xs text-[#6b7280]">{leader.email}</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Departemen", leader.ledTeam?.department.name ?? leader.department?.name ?? "-"],
          ["Tim", leader.ledTeam?.name ?? "Belum memiliki tim"],
          ["Anggota tim", leader.ledTeam?.members.length ?? 0],
          ["Target bulan ini", leader.targets.length],
        ].map(([label, value]) => (
          <div key={label} className="flex min-h-[68px] items-center justify-between gap-3 rounded-md border border-[#e5e7eb] bg-white px-3.5 py-3">
            <span className="text-xs text-[#6b7280]">{label}</span>
            <strong className="max-w-[65%] truncate text-sm tabular-nums">{value}</strong>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-md border border-[#e5e7eb] bg-white">
          <h2 className="border-b border-[#e5e7eb] px-4 py-3 text-xs font-semibold uppercase tracking-wide">Profil</h2>
          <dl className="divide-y divide-[#f1f3f5] px-4">
            <Info label="Nama" value={leader.name} />
            <Info label="Email" value={leader.email} />
            <Info label="Telepon" value={leader.phoneNumber ?? "-"} />
            <Info label="Status akun" value={leader.isActive} />
            <Info label="Status tim" value={leader.ledTeam ? (leader.ledTeam.isActive ? "Aktif" : "Nonaktif") : "Tidak ada tim"} />
          </dl>
        </div>
        <div className="rounded-md border border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide">Progres Target Bulan Ini</h2>
            <strong className="text-sm tabular-nums">{targetPercent}%</strong>
          </div>
          <div className="space-y-2 px-4 py-3">
            {leader.targets.map((target) => (
              <div key={target.id} className="flex items-center justify-between gap-3 border-b border-[#f1f3f5] py-2 text-xs last:border-0">
                <span>{target.name}</span>
                <span className="shrink-0 text-[#6b7280]">{target.currentValue.toLocaleString("id-ID")} / {target.targetValue.toLocaleString("id-ID")}</span>
              </div>
            ))}
            {leader.targets.length === 0 && <p className="text-xs text-[#6b7280]">Belum ada target.</p>}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-[#e5e7eb] bg-white">
        <div className="border-b border-[#e5e7eb] px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Anggota Tim</h2>
          <p className="mt-1 text-[11px] text-[#6b7280]">{leader.ledTeam?.members.length ?? 0} pengguna</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead><tr className="border-b border-[#e5e7eb] text-[10px] uppercase tracking-wide text-[#6b7280]"><th className="px-3 py-2 font-semibold">Nama</th><th className="px-3 py-2 font-semibold">Email</th><th className="px-3 py-2 font-semibold">Jabatan</th><th className="px-3 py-2 font-semibold">Status</th></tr></thead>
            <tbody>
              {leader.ledTeam?.members.map((member) => (
                <tr key={member.id} className="border-b border-[#f1f3f5] last:border-0"><td className="px-3 py-2.5 font-medium">{member.name}</td><td className="px-3 py-2.5 text-[#6b7280]">{member.email}</td><td className="px-3 py-2.5">{member.position ?? "-"}</td><td className="px-3 py-2.5">{member.isActive}</td></tr>
              ))}
              {!leader.ledTeam?.members.length && <tr><td colSpan={4} className="px-3 py-7 text-center text-xs text-[#6b7280]">Belum ada anggota tim.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-[#e5e7eb] bg-white">
        <div className="border-b border-[#e5e7eb] px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Berkas Tim</h2>
          <p className="mt-1 text-[11px] text-[#6b7280]">{leader.ledTeam?.uploads.length ?? 0} terbaru · {submittedUploads.length} sudah dikirim dari daftar ini</p>
        </div>
        <div className="divide-y divide-[#f1f3f5]">
          {leader.ledTeam?.uploads.map((upload) => (
            <article key={upload.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[1.4fr_1fr_0.8fr_auto] sm:items-center">
              <a href={upload.filePath} target="_blank" rel="noreferrer" className="truncate text-xs font-medium text-[#1f6c9f] hover:underline">{upload.fileName}</a>
              <span className="truncate text-xs">{upload.user.name}</span>
              <span className="text-xs text-[#6b7280]">{upload.category} · {upload.isSubmitted ? "Terkirim" : "Belum dikirim"}</span>
              <time className="text-[11px] text-[#6b7280]">{upload.createdAt.toLocaleString("id-ID")}</time>
            </article>
          ))}
          {!leader.ledTeam?.uploads.length && <p className="px-4 py-7 text-center text-xs text-[#6b7280]">Belum ada berkas tim.</p>}
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-1 py-3 sm:grid-cols-[8rem_minmax(0,1fr)]"><dt className="text-[11px] text-[#6b7280]">{label}</dt><dd className="break-words text-xs font-medium">{value}</dd></div>;
}
