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
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-[#e5e7eb] bg-white p-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#6b7280]">
              Informasi
            </p>
            <h1 className="text-base font-bold">Pengumuman Tim</h1>
            <p className="mt-2 max-w-xl text-sm text-[#6b7280]">
              Sampaikan informasi terbaru kepada anggota tim dengan cepat dan jelas.
            </p>
          </div>
        </header>

        <NewAnnouncementForm />

        <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
          <p className="mb-4 text-xs text-[#6b7280]">Pengumuman otomatis hilang setelah 12 jam.</p>
          <div className="space-y-1">
            {visibleAnnouncements.length > 0 ? visibleAnnouncements.map((item) => (
              <div key={item.id} className="rounded-lg border border-[#e5e7eb] p-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.title}</p>
                      {item.isPinned && (
                        <span className="rounded-full bg-[#fbf3db] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#956400]">
                          Info penting
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-[#6b7280]">{item.content}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap justify-end gap-2">
                    <PinAnnouncementForm announcementId={item.id} isPinned={item.isPinned} />
                    <DeleteAnnouncementForm announcementId={item.id} />
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-[#6b7280]">Belum ada pengumuman yang dibuat untuk tim Anda.</p>
            )}
          </div>
          <PaginationControls basePath="/dashboard/manajer/pengumuman" page={page} totalItems={announcements.length} />
        </section>
      </div>
    </main>
  );
}
