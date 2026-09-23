import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/auth";
import { PaginationControls } from "@/app/components/pagination-controls";

export default async function DataPentingPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const employee = await requireEmployee();
  const params = await searchParams;
  const pageSize = 6;
  const requestedPage = Math.max(1, Number(params.page) || 1);
  const totalFiles = await prisma.importantFile.count({ where: { userId: employee.id } });
  const totalPages = Math.max(1, Math.ceil(totalFiles / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const importantFiles = await prisma.importantFile.findMany({
    where: {
      userId: employee.id,
    },
    orderBy: {
      savedAt: "desc",
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
          <h1 className="mt-2 text-base font-bold">Data Penting</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            File yang disimpan di sini tidak mengikuti batas waktu berkas biasa.
          </p>
        </header>

        {importantFiles.length > 0 ? (
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {importantFiles.map((file) => (
              <article key={file.id} className="rounded-lg border-2 border-[#e8d9a8] bg-[#fbf3db] p-4">
                <p className="font-medium text-yellow-900">{file.title}</p>
                <p className="mt-1 text-sm text-[#956400]">
                  {file.fileName} • {file.category}
                </p>
                <p className="mt-1 text-xs text-[#956400]">
                  {new Date(file.savedAt).toLocaleDateString("id-ID")}
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
                  <form action="/api/karyawan/upload" method="POST">
                    <input type="hidden" name="action" value="delete-important" />
                    <input type="hidden" name="uploadId" value={file.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-lg border border-red-300 bg-[#fdebec] px-4 py-2 text-sm font-medium text-[#9f2f2d] hover:bg-[#fdebec]"
                    >
                      Hapus
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <p className="rounded-lg bg-[#fbf3db] px-4 py-3 text-sm text-[#956400]">
            Belum ada file data penting.
          </p>
        )}
        <PaginationControls basePath="/dashboard/karyawan/data-penting" page={page} totalItems={totalFiles} />
      </div>
    </main>
  );
}
