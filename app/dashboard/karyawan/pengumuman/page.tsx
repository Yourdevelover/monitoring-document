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
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Informasi
          </p>
          <h1 className="mt-2 text-3xl font-bold">Pengumuman Tim</h1>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="space-y-3">
            {announcements.length > 0 ? (
              announcements.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-4">
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
              ))
            ) : (
              <p className="text-slate-600">Belum ada pengumuman untuk tim Anda.</p>
            )}
          </div>
          <PaginationControls basePath="/dashboard/karyawan/pengumuman" page={page} totalItems={totalAnnouncements} />
        </section>
      </div>
    </main>
  );
}
