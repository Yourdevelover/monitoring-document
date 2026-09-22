import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/auth";
import { PaginationControls } from "@/app/components/pagination-controls";

export default async function EmployeeProfileRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const employee = await requireEmployee();
  const params = await searchParams;
  const pageSize = 6;
  const requestedPage = Math.max(1, Number(params.page) || 1);
  const totalRequests = await prisma.profileRequest.count({ where: { userId: employee.id } });
  const totalPages = Math.max(1, Math.ceil(totalRequests / pageSize));
  const page = Math.min(requestedPage, totalPages);

  const requests = await prisma.profileRequest.findMany({
    where: {
      userId: employee.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Profil
          </p>
          <h1 className="mt-2 text-3xl font-bold">Pengajuan Profil</h1>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="space-y-3">
            {requests.length > 0 ? (
              requests.map((request) => (
                <div key={request.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-medium">{request.fieldName}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Dari: {request.oldValue ?? "-"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Baru: {request.newValue ?? "-"}
                  </p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Status: {request.status}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-600">Belum ada pengajuan profil yang dibuat.</p>
            )}
          </div>
          <PaginationControls basePath="/dashboard/karyawan/pengajuan-profil" page={page} totalItems={totalRequests} />
        </section>
      </div>
    </main>
  );
}
