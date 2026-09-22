import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/auth";
import { DeleteAnnouncementForm } from "./delete-announcement-form";
import { NewAnnouncementForm } from "./new-announcement-form";
import { PinAnnouncementForm } from "./pin-announcement-form";
import { PaginationControls } from "@/app/components/pagination-controls";

export default async function ManagerAnnouncementsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const manager = await requireManager();
  const params = await searchParams;
  const activeSince = new Date();
  activeSince.setHours(activeSince.getHours() - 12);

  const team = await prisma.team.findUnique({
    where: { managerId: manager.id },
    include: {
      announcements: {
        where: {
          OR: [{ isPinned: true }, { createdAt: { gte: activeSince } }],
        },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      },
    },
  });
  const pageSize = 6;
  const requestedPage = Math.max(1, Number(params.page) || 1);
  const announcements = team?.announcements ?? [];
  const totalPages = Math.max(1, Math.ceil(announcements.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const visibleAnnouncements = announcements.slice((page - 1) * pageSize, page * pageSize);

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
              Informasi
            </p>
            <h1 className="mt-2 text-3xl font-bold">Pengumuman Tim</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-500">
              Sampaikan informasi terbaru kepada anggota tim dengan cepat dan jelas.
            </p>
          </div>
        </header>

        <NewAnnouncementForm />

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-4 text-xs text-slate-500">Pengumuman otomatis hilang setelah 12 jam.</p>
          <div className="space-y-1">
            {visibleAnnouncements.length > 0 ? visibleAnnouncements.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.title}</p>
                      {item.isPinned && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                          Info penting
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{item.content}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap justify-end gap-2">
                    <PinAnnouncementForm announcementId={item.id} isPinned={item.isPinned} />
                    <DeleteAnnouncementForm announcementId={item.id} />
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-slate-600">Belum ada pengumuman yang dibuat untuk tim Anda.</p>
            )}
          </div>
          <PaginationControls basePath="/dashboard/manajer/pengumuman" page={page} totalItems={announcements.length} />
        </section>
      </div>
    </main>
  );
}
