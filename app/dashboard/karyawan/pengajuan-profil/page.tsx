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
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-lg border border-[#e5e7eb] bg-white p-5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#6b7280]">
            Profil
          </p>
          <h1 className="text-base font-bold">Pengajuan Profil</h1>
        </header>

        <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
          <div className="space-y-3">
            {requests.length > 0 ? (
              requests.map((request) => (
                <div key={request.id} className="rounded-lg border border-[#e5e7eb] p-4">
                  <p className="font-medium">{request.fieldName}</p>
                  <p className="mt-1 text-sm text-[#6b7280]">
                    Dari: {request.oldValue ?? "-"}
                  </p>
                  <p className="mt-1 text-sm text-[#6b7280]">
                    Baru: {request.newValue ?? "-"}
                  </p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                    Status: {request.status}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-[#6b7280]">Belum ada pengajuan profil yang dibuat.</p>
            )}
          </div>
          <PaginationControls basePath="/dashboard/karyawan/pengajuan-profil" page={page} totalItems={totalRequests} />
        </section>
      </div>
    </main>
  );
}
