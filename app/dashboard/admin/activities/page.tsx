import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaginationControls } from "@/app/components/pagination-controls";
import { DateFilter } from "./date-filter";
import { DeleteSelectedButton } from "./delete-selected-button";
import { ActivityRow } from "./activity-row";
import { FilterSelect } from "./filter-select";
import { SearchInput } from "./search-input";

export default async function AdminActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; date?: string; action?: string; q?: string; deleted?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const pageSize = 30;
  const requestedPage = Math.max(1, Number(params.page) || 1);
  const selectedDate = /^\d{4}-\d{2}-\d{2}$/.test(params.date ?? "") ? params.date! : null;
  const selectedAction = params.action || null;
  const searchQuery = params.q?.trim() || null;
  const deletedCount = Number(params.deleted) || 0;

  // Build date list from all logs (oldest → newest)
  const allLogs = await prisma.activityLog.findMany({
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  const dateCounts = new Map<string, number>();
  for (const log of allLogs) {
    const day = log.createdAt.toISOString().slice(0, 10);
    dateCounts.set(day, (dateCounts.get(day) ?? 0) + 1);
  }
  const dateList = [...dateCounts.entries()].map(([date, count]) => ({ date, count }));

  // Distinct actions for filter dropdown
  const distinctActions = await prisma.activityLog.findMany({ select: { action: true }, distinct: ["action"], orderBy: { action: "asc" } });
  const actionList = distinctActions.map((r) => r.action);

  // Build where
  const where: Record<string, unknown> = {};
  if (selectedDate) {
    const start = new Date(`${selectedDate}T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    where.createdAt = { gte: start, lt: end };
  }
  if (selectedAction) where.action = selectedAction;
  if (searchQuery) {
    where.OR = [
      { description: { contains: searchQuery, mode: "insensitive" } },
      { action: { contains: searchQuery, mode: "insensitive" } },
      { actor: { is: { name: { contains: searchQuery, mode: "insensitive" } } } },
    ];
  }

  const totalActivities = await prisma.activityLog.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalActivities / pageSize));
  const page = Math.min(requestedPage, totalPages);

  const activities = await prisma.activityLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      actor: true,
    },
  });

  return (
    <main className="space-y-4">
      <header className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Audit Log</p>
        <h1 className="mt-1 text-[13px] font-semibold tracking-tight">Log Aktivitas</h1>
        <p className="mt-1 text-xs text-[#6b7280]">Catat aktivitas sistem.</p>
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1">
            <SearchInput initialQuery={searchQuery} date={selectedDate} action={selectedAction} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <FilterSelect
              name="action"
              placeholder="Pilih aksi"
              options={actionList}
              selected={selectedAction}
              params={{ date: selectedDate }}
            />
            <DateFilter dateList={dateList} selectedDate={selectedDate} />
            <a href="/dashboard/admin/activities" className="inline-flex h-[30px] items-center rounded-md border border-[#e5e7eb] bg-white px-3 text-xs font-medium hover:bg-[#f8f9fa]">
              Reset filter
            </a>
            {selectedDate ? (
              <DeleteSelectedButton selectedDate={selectedDate} />
            ) : (
              <button
                type="button"
                disabled
                title="Pilih tanggal dulu untuk menghapus"
                className="inline-flex h-[30px] cursor-not-allowed items-center rounded-md border border-[#e5e7eb] bg-[#f8f9fa] px-3 text-xs font-medium text-[#9ca3af]"
              >
                Hapus
              </button>
            )}
          </div>
        </div>
      </header>

      {deletedCount > 0 && (
        <p className="rounded-lg border border-[#edf3ec] bg-[#edf3ec] px-3 py-1.5 text-[11px] font-medium text-[#346538]">
          {deletedCount} log berhasil dihapus.
        </p>
      )}

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e5e7eb] text-[10px] uppercase tracking-wide text-[#6b7280]">
                <th className="whitespace-nowrap px-2 py-1 font-semibold">Waktu</th>
                <th className="whitespace-nowrap px-2 py-1 font-semibold">Aktor</th>
                <th className="whitespace-nowrap px-2 py-1 font-semibold">Aksi</th>
                <th className="whitespace-nowrap px-2 py-1 font-semibold">Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <ActivityRow
                  key={activity.id}
                  activity={{
                    id: activity.id,
                    createdAt: activity.createdAt.toISOString(),
                    action: activity.action,
                    description: activity.description,
                    actor: activity.actor ? { name: activity.actor.name } : null,
                  }}
                />
              ))}
              {activities.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-2 py-4 text-center text-[11px] text-[#6b7280]">
                    {selectedDate ? `Tidak ada log pada ${selectedDate}.` : "Belum ada log aktivitas."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls basePath="/dashboard/admin/activities" page={page} totalItems={totalActivities} pageSize={pageSize} query={{ date: selectedDate, action: selectedAction, q: searchQuery }} />
      </section>
    </main>
  );
}
