import { prisma } from "@/lib/prisma";
import { requireManajer } from "@/lib/auth";
import { PaginationControls } from "@/app/components/pagination-controls";

export default async function ManagerProfileRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireManajer();
  const params = await searchParams;
  const pageSize = 12;
  const requestedPage = Math.max(1, Number(params.page) || 1);
  const totalItems = await prisma.profileRequest.count();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const requests = await prisma.profileRequest.findMany({
    include: {
      user: { include: { department: true, team: true } },
      reviewer: true,
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="border-b border-[#e5e7eb] pb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
            Seluruh departemen
          </p>
          <h1 className="mt-1 text-[15px] font-semibold">
            Riwayat Pengajuan Profil
          </h1>
        </header>
        <section className="divide-y divide-[#e5e7eb] border-y border-[#d1d5db] bg-white">
          {requests.map((request) => (
            <article
              key={request.id}
              className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <div>
                <p className="text-xs font-semibold">{request.user.name}</p>
                <p className="mt-1 text-[11px] text-[#6b7280]">
                  {request.user.email} ·{" "}
                  {request.user.department?.name ?? request.user.team?.name ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs">{request.fieldName}</p>
                <p className="mt-1 break-words text-[11px] text-[#6b7280]">
                  {request.oldValue ?? "-"} → {request.newValue ?? "-"}
                </p>
              </div>
              <div className="text-xs">
                <span className="font-medium">{request.status}</span>
                <time className="mt-1 block text-[11px] text-[#6b7280]">
                  {request.createdAt.toLocaleString("id-ID")}
                </time>
                {request.reviewer && (
                  <span className="mt-1 block text-[11px] text-[#6b7280]">
                    Ditinjau: {request.reviewer.name}
                  </span>
                )}
              </div>
            </article>
          ))}
          {requests.length === 0 && (
            <p className="px-4 py-8 text-center text-xs text-[#6b7280]">
              Belum ada pengajuan profil.
            </p>
          )}
        </section>
        <PaginationControls
          basePath="/dashboard/manajer/pengajuan-profil"
          page={page}
          totalItems={totalItems}
        />
      </div>
    </main>
  );
}
