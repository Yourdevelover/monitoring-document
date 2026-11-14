import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { PaginationControls } from "@/app/components/pagination-controls";

export default async function ManagerActivityPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const pageSize = 25;
  const requestedPage = Math.max(1, Number(params.page) || 1);
  const totalItems = await prisma.activityLog.count();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const activities = await prisma.activityLog.findMany({ include: { actor: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize });
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="border-b border-[#e5e7eb] pb-3"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Log sistem</p><h1 className="mt-1 text-[15px] font-semibold">Riwayat Aktivitas</h1><p className="mt-1 text-xs text-[#6b7280]">{totalItems} aktivitas tercatat.</p></header>
        <section className="divide-y divide-[#e5e7eb] border-y border-[#d1d5db] bg-white">{activities.map((activity) => <article key={activity.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[1fr_1.5fr_auto] sm:items-center"><div><p className="text-xs font-semibold">{activity.actor?.name ?? "Sistem"}</p><p className="text-[11px] text-[#6b7280]">{activity.actor?.email ?? "-"} · {activity.action}</p></div><p className="text-xs text-[#374151]">{activity.description}</p><time className="text-[11px] text-[#6b7280]">{activity.createdAt.toLocaleString("id-ID")}</time></article>)}{activities.length === 0 && <p className="px-4 py-8 text-center text-xs text-[#6b7280]">Belum ada aktivitas.</p>}</section>
        <PaginationControls basePath="/dashboard/manajer/aktivitas" page={page} totalItems={totalItems} />
      </div>
    </main>
  );
}