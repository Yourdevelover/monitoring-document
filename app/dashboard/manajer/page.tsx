import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireManajer } from "@/lib/auth";

export default async function ManagerDashboardPage() {
  const manager = await requireManajer();
  const activeSince = new Date();
  activeSince.setHours(activeSince.getHours() - 12);
  const period = new Date().toISOString().slice(0, 7);
  const [employees, activeEmployees, uploads, targets, pendingRequests, announcements, departments] = await Promise.all([
    prisma.user.count({ where: { role: "KARYAWAN" } }),
    prisma.user.count({ where: { role: "KARYAWAN", isActive: "ACTIVE" } }),
    prisma.upload.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: true, team: { include: { department: true } } } }),
    prisma.target.findMany({ where: { period }, include: { user: true }, orderBy: { updatedAt: "desc" } }),
    prisma.profileRequest.count({ where: { status: "PENDING" } }),
    prisma.announcement.findMany({ where: { OR: [{ isPinned: true }, { createdAt: { gte: activeSince } }] }, include: { leader: true, team: true }, orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }], take: 8 }),
    prisma.department.findMany({ include: { _count: { select: { users: true, teams: true } } }, orderBy: { name: "asc" } }),
  ]);
  const averageProgress = targets.length
    ? Math.round(targets.reduce((sum, target) => sum + (target.targetValue > 0 ? target.currentValue / target.targetValue * 100 : 0), 0) / targets.length)
    : 0;
  const cards = [
    { label: "Seluruh karyawan", value: employees, href: "/dashboard/manajer/karyawan" },
    { label: "Karyawan aktif", value: activeEmployees, href: "/dashboard/manajer/karyawan" },
    { label: "Berkas tersimpan", value: await prisma.upload.count(), href: "/dashboard/manajer/berkas" },
    { label: "Target bulan ini", value: targets.length, href: "/dashboard/manajer/target" },
    { label: "Pengajuan profil", value: pendingRequests, href: "/dashboard/manajer/pengajuan-profil" },
    { label: "Rata-rata target", value: `${averageProgress}%`, href: "/dashboard/manajer/target" },
  ];

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="border-b border-[#e5e7eb] pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Panel pemantauan</p>
          <h1 className="mt-1 text-[15px] font-semibold">Dashboard Manajer</h1>
          <p className="mt-1 text-xs text-[#6b7280]">{manager.name} · Data seluruh departemen</p>
        </header>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link key={card.label} href={card.href} className="flex items-center justify-between border-b border-[#d1d5db] bg-white px-4 py-3 hover:bg-[#f8f9fa]">
              <span className="text-xs text-[#6b7280]">{card.label}</span>
              <strong className="text-lg">{card.value}</strong>
            </Link>
          ))}
        </section>
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="border-y border-[#d1d5db] bg-white">
            <h2 className="border-b border-[#e5e7eb] px-4 py-3 text-xs font-semibold uppercase">Departemen</h2>
            {departments.map((department) => (
              <div key={department.id} className="flex items-center justify-between gap-3 border-b border-[#f1f3f5] px-4 py-2.5 text-xs last:border-0">
                <span>{department.name}</span>
                <span className="text-[#6b7280]">{department._count.users} karyawan · {department._count.teams} tim</span>
              </div>
            ))}
          </div>
          <div className="border-y border-[#d1d5db] bg-white">
            <h2 className="border-b border-[#e5e7eb] px-4 py-3 text-xs font-semibold uppercase">Berkas terbaru</h2>
            {uploads.map((upload) => (
              <div key={upload.id} className="border-b border-[#f1f3f5] px-4 py-2.5 last:border-0">
                <p className="truncate text-xs font-medium">{upload.fileName}</p>
                <p className="mt-1 text-[11px] text-[#6b7280]">{upload.user.name} · {upload.team.department.name} · {new Date(upload.createdAt).toLocaleString("id-ID")}</p>
              </div>
            ))}
            {uploads.length === 0 && <p className="px-4 py-5 text-xs text-[#6b7280]">Belum ada berkas.</p>}
          </div>
        </section>
        <section className="border-y border-[#d1d5db] bg-white">
          <h2 className="border-b border-[#e5e7eb] px-4 py-3 text-xs font-semibold uppercase">Pengumuman terbaru</h2>
          {announcements.map((announcement) => (
            <article key={announcement.id} className="border-b border-[#f1f3f5] px-4 py-3 last:border-0">
              <p className="text-xs font-semibold">{announcement.title} <span className="font-normal text-[#6b7280]">· {announcement.team.name} · {announcement.leader.name}</span></p>
              <p className="mt-1 text-xs text-[#374151]">{announcement.content}</p>
            </article>
          ))}
          {announcements.length === 0 && <p className="px-4 py-5 text-xs text-[#6b7280]">Belum ada pengumuman.</p>}
        </section>
      </div>
    </main>
  );
}
