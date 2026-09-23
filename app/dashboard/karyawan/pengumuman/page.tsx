import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/auth";
import { PaginationControls } from "@/app/components/pagination-controls";

export default async function EmployeeAnnouncementsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const employee = await requireEmployee();
  const params = await searchParams;
  const activeSince = new Date();
  activeSince.setHours(activeSince.getHours() - 12);
  const pageSize = 6;
  const requestedPage = Math.max(1, Number(params.page) || 1);
  const announcementWhere = {
    teamId: employee.teamId ?? 0,
    OR: [{ isPinned: true }, { createdAt: { gte: activeSince } }],
  };
  const totalAnnouncements = await prisma.announcement.count({ where: announcementWhere });
  const totalPages = Math.max(1, Math.ceil(totalAnnouncements / pageSize));
  const page = Math.min(requestedPage, totalPages);

  const announcements = await prisma.announcement.findMany({
    where: announcementWhere,
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-lg border border-[#e5e7eb] bg-white p-5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#6b7280]">
            Informasi
          </p>
          <h1 className="text-base font-bold">Pengumuman Tim</h1>
        </header>

        <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
          <div className="space-y-3">
            {announcements.length > 0 ? (
              announcements.map((item) => (
                <div key={item.id} className="rounded-lg border border-[#e5e7eb] p-4">
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
              ))
            ) : (
              <p className="text-[#6b7280]">Belum ada pengumuman untuk tim Anda.</p>
            )}
          </div>
          <PaginationControls basePath="/dashboard/karyawan/pengumuman" page={page} totalItems={totalAnnouncements} />
        </section>
      </div>
    </main>
  );
}
