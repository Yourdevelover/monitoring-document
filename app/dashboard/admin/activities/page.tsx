import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaginationControls } from "@/app/components/pagination-controls";

export default async function AdminActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const pageSize = 6;
  const requestedPage = Math.max(1, Number(params.page) || 1);
  const totalActivities = await prisma.activityLog.count();
  const totalPages = Math.max(1, Math.ceil(totalActivities / pageSize));
  const page = Math.min(requestedPage, totalPages);

  const activities = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      actor: true,
    },
  });

  return (
    <main className="space-y-4 p-2">
      <header className="rounded-lg border border-[#e5e7eb] bg-white p-5">
        <p className="text-sm text-[#6b7280]">Audit Log</p>
        <h1 className="text-base font-bold">Log Aktivitas</h1>
      </header>

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb] text-[#6b7280]">
                <th className="py-2 pr-4">Waktu</th>
                <th className="py-2 pr-4">Aktor</th>
                <th className="py-2 pr-4">Aksi</th>
                <th className="py-2 pr-4">Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} className="border-b border-[#e5e7eb]">
                  <td className="py-3 pr-4">{new Date(activity.createdAt).toLocaleString("id-ID")}</td>
                  <td className="py-3 pr-4">{activity.actor?.name ?? "System"}</td>
                  <td className="py-3 pr-4">{activity.action}</td>
                  <td className="py-3 pr-4">{activity.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationControls basePath="/dashboard/admin/activities" page={page} totalItems={totalActivities} />
      </section>
    </main>
  );
}
