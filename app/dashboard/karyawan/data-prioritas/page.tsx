import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/auth";
import { PaginationControls } from "@/app/components/pagination-controls";
import { DeleteImportantButton } from "./delete-priority-button";
import { getUploadFileName } from "@/lib/upload-file";

export default async function DataPentingPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const employee = await requireEmployee();
  const params = await searchParams;
  const pageSize = 20;
  const requestedPage = Math.max(1, Number(params.page) || 1);
  const priorityWhere = {
    userId: employee.id,
    isImportant: true,
    submissionDate: { not: null },
  };
  const totalFiles = await prisma.upload.count({ where: priorityWhere });
  const totalPages = Math.max(1, Math.ceil(totalFiles / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const importantFiles = await prisma.upload.findMany({
    where: priorityWhere,
    orderBy: { submissionDate: "desc" },
    select: {
      id: true,
      filePath: true,
      category: true,
      submissionDate: true,
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return (
    <main className="min-h-screen text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-lg border border-[#e5e7eb] bg-white p-5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#6b7280]">
            Penyimpanan permanen
          </p>
          <h1 className="mt-2 text-base font-bold">Data Prioritas</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            File yang disimpan di sini tidak mengikuti batas waktu berkas biasa.
          </p>
        </header>

        {importantFiles.length > 0 ? (
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {importantFiles.map((file) => (
              <article key={file.id} className="rounded-lg border-2 border-[#e8d9a8] bg-[#fbf3db] p-4">
                <p className="font-medium text-yellow-900">{getUploadFileName(file.filePath)}</p>
                <p className="mt-1 text-sm text-[#956400]">
                  {file.category}
                </p>
                <p className="mt-1 text-xs text-[#956400]">
                  {file.submissionDate?.toLocaleDateString("id-ID") ?? "Belum dikirim"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={file.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg bg-[#956400] px-4 py-2 text-sm font-medium text-white hover:bg-[#956400]"
                  >
                    Lihat file
                  </a>
                  <DeleteImportantButton fileId={file.id} />
                </div>
              </article>
            ))}
          </section>
        ) : (
          <p className="rounded-lg bg-[#fbf3db] px-4 py-3 text-sm text-[#956400]">
            Belum ada file data prioritas.
          </p>
        )}
        <PaginationControls basePath="/dashboard/karyawan/data-prioritas" page={page} totalItems={totalFiles} />
      </div>
    </main>
  );
}


