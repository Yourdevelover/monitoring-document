import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/auth";
import { PaginationControls } from "@/app/components/pagination-controls";

function parseProfilePayload(value: string | null | undefined) {
  if (!value) {
    return {} as Record<string, string | null>;
  }

  try {
    return JSON.parse(value) as Record<string, string | null>;
  } catch {
    return {} as Record<string, string | null>;
  }
}

export default async function ManagerProfileRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const manager = await requireManager();
  const params = await searchParams;
  const pageSize = 6;
  const requestedPage = Math.max(1, Number(params.page) || 1);

  const team = await prisma.team.findUnique({
    where: { managerId: manager.id },
  });

  const requestWhere = {
    status: "PENDING" as const,
    user: { teamId: team?.id },
  };
  const totalRequests = await prisma.profileRequest.count({ where: requestWhere });
  const totalPages = Math.max(1, Math.ceil(totalRequests / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const requests = await prisma.profileRequest.findMany({
    where: requestWhere,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      user: true,
    },
  });

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-lg border border-[#e5e7eb] bg-white p-5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#6b7280]">
            Persetujuan
          </p>
          <h1 className="text-base font-bold">Persetujuan Profil</h1>
        </header>

        <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#111111]">Daftar Permintaan</h2>
              <p className="text-sm text-[#6b7280]">
                {requests.length} permintaan menunggu persetujuan.
              </p>
            </div>

            {requests.length > 0 ? (
              <form action="/api/manajer/profile-request" method="POST">
                <input type="hidden" name="action" value="approve" />
                <button
                  type="submit"
                  className="rounded-lg bg-[#346538] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2d5a30]"
                >
                  Setujui Semua
                </button>
              </form>
            ) : null}
          </div>

          <div className="space-y-3">
            {requests.length > 0 ? (
              requests.map((request) => {
                const oldPayload = parseProfilePayload(request.oldValue);
                const newPayload = parseProfilePayload(request.newValue);
                const changeDetails = [] as string[];

                if (newPayload.name && oldPayload.name !== newPayload.name) {
                  changeDetails.push(`Nama: ${oldPayload.name ?? "-"} → ${newPayload.name}`);
                }

                if (newPayload.email && oldPayload.email !== newPayload.email) {
                  changeDetails.push(`Email: ${oldPayload.email ?? "-"} → ${newPayload.email}`);
                }

                if (newPayload.password) {
                  changeDetails.push("Password: akan diganti");
                }

                return (
                  <div key={request.id} className="rounded-lg border border-[#e5e7eb] p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-medium">{request.user.name}</p>
                        <p className="text-sm text-[#6b7280]">
                          {request.fieldName} • Status: {request.status}
                        </p>
                        <div className="mt-2 space-y-1 text-sm text-[#6b7280]">
                          {changeDetails.length > 0 ? (
                            changeDetails.map((detail) => <p key={detail}>{detail}</p>)
                          ) : (
                            <p>Perubahan profil belum bisa ditampilkan.</p>
                          )}
                        </div>
                      </div>

                      {request.status === "PENDING" ? (
                        <div className="flex gap-2">
                          <form action="/api/manajer/profile-request" method="POST">
                            <input type="hidden" name="requestId" value={request.id} />
                            <input type="hidden" name="action" value="approve" />
                            <button
                              type="submit"
                              className="rounded-lg bg-[#346538] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2d5a30]"
                            >
                              Setujui
                            </button>
                          </form>

                          <form action="/api/manajer/profile-request" method="POST">
                            <input type="hidden" name="requestId" value={request.id} />
                            <input type="hidden" name="action" value="reject" />
                            <button
                              type="submit"
                              className="rounded-lg border border-red-300 bg-[#fdebec] px-4 py-2 text-sm font-medium text-[#9f2f2d] transition hover:bg-[#fdebec]"
                            >
                              Tolak
                            </button>
                          </form>
                        </div>
                      ) : (
                        <span className="rounded-full bg-[#f8f9fa] px-3 py-1 text-xs font-medium text-[#6b7280]">
                          {request.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-[#6b7280]">Belum ada permintaan perubahan profil.</p>
            )}
          </div>
          <PaginationControls basePath="/dashboard/manajer/pengajuan-profil" page={page} totalItems={totalRequests} />
        </section>
      </div>
    </main>
  );
}
