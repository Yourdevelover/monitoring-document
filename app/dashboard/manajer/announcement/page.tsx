import { prisma } from "@/lib/prisma";
import { requireManajer } from "@/lib/auth";
import { PaginationControls } from "@/app/components/pagination-controls";

export default async function ManagerAnnouncementsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireManajer();
  const params = await searchParams;
  const pageSize = 12;
  const requestedPage = Math.max(1, Number(params.page) || 1);
  const totalItems = await prisma.announcement.count();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const announcements = await prisma.announcement.findMany({ include: { leader: true, team: { include: { department: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize });

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="border-b border-[#e5e7eb] pb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
            Informasi lintas tim
          </p>
          <h1 className="mt-1 text-[15px] font-semibold">Pengumuman</h1>
        </header>
        <section className="divide-y divide-[#e5e7eb] border-y border-[#d1d5db] bg-white">
          {announcements.map((item) => (
            <article key={item.id} className="px-4 py-3">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h2 className="text-xs font-semibold">{item.title}</h2>
                {item.isPinned && (
                  <span className="text-[10px] font-semibold text-[#956400]">
                    PENTING
                  </span>
                )}
                <span className="text-[11px] text-[#6b7280]">
                  {item.team.department.name} · {item.team.name} ·{" "}
                  {item.leader.name}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-xs text-[#374151]">
                {item.content}
              </p>
              <time className="mt-2 block text-[11px] text-[#6b7280]">
                {item.createdAt.toLocaleString("id-ID")}
              </time>
            </article>
          ))}
          {announcements.length === 0 && (
            <p className="px-4 py-8 text-center text-xs text-[#6b7280]">
              Belum ada pengumuman.
            </p>
          )}
        </section>
        <PaginationControls
          basePath="/dashboard/manajer/announcement"
          page={page}
          totalItems={totalItems}
        />
      </div>
    </main>
  );
}
