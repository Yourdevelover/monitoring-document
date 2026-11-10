import { prisma } from "@/lib/prisma";
import { requireLeader } from "@/lib/auth";
import { PaginationControls } from "@/app/components/pagination-controls";

export default async function LeaderImportantFilesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const leader = await requireLeader();
  const params = await searchParams;
  const pageSize = 8;
  const requestedPage = Math.max(1, Number(params.page) || 1);
  const team = await prisma.team.findUnique({
    where: { leaderId: leader.id },
    select: { id: true },
  });
  const where = {
    teamId: team?.id ?? 0,
    isImportant: true,
    isSubmitted: true,
  };
  const totalFiles = await prisma.upload.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalFiles / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const files = await prisma.upload.findMany({
    where,
    include: { user: { select: { name: true, email: true } } },
    orderBy: { submissionDate: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return (
    <main className="min-h-screen text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#956400]">Berkas tim</p>
          <h1 className="mt-1 text-[15px] font-semibold tracking-tight">Data Prioritas</h1>
          <p className="mt-1 text-xs text-[#6b7280]">Berkas yang ditandai penting oleh karyawan akan tersimpan di sini.</p>
        </header>

        {files.length > 0 ? (
          <section className="divide-y divide-[#eadfb9] rounded-lg border border-[#e8d9a8] bg-white">
            {files.map((file) => (
              <article key={file.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[13px] font-semibold">{file.title || file.fileName}</p>
                    <span className="rounded bg-[#fbf3db] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#956400]">{file.category.toLowerCase()}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-[#6b7280]">{file.fileName}</p>
                  <p className="mt-1 text-xs text-[#6b7280]">
                    Dari {file.user.name} · {new Date(file.submissionDate).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <a href={file.filePath} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center rounded-md border border-[#e5e7eb] px-3 text-xs font-medium hover:bg-[#f8f9fa]">
                    Lihat
                  </a>
                  <a href={file.filePath} download={file.fileName} className="inline-flex h-8 items-center rounded-md bg-[#111111] px-3 text-xs font-medium text-white hover:bg-[#333333]">
                    Unduh
                  </a>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <p className="rounded-lg border border-dashed border-[#e8d9a8] bg-white px-4 py-8 text-center text-sm text-[#6b7280]">
            Belum ada berkas yang ditandai sebagai data prioritas.
          </p>
        )}

        <PaginationControls basePath="/dashboard/leader/data-prioritas" page={page} totalItems={totalFiles} pageSize={pageSize} />
      </div>
    </main>
  );
}