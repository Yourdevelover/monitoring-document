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
    <main className="min-h-screen text-slate-900">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Penyimpanan permanen
          </p>
          <h1 className="mt-2 text-2xl font-bold">Data Penting</h1>
          <p className="mt-1 text-sm text-slate-600">
            File yang disimpan di sini tidak mengikuti batas waktu berkas biasa.
          </p>
        </header>

        {importantFiles.length > 0 ? (
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {importantFiles.map((file) => (
              <article key={file.id} className="rounded-xl border-2 border-yellow-300 bg-yellow-50 p-4">
                <p className="font-medium text-yellow-900">{file.title}</p>
                <p className="mt-1 text-sm text-yellow-700">
                  {file.fileName} • {file.category}
                </p>
                <p className="mt-1 text-xs text-yellow-700">
                  {new Date(file.savedAt).toLocaleDateString("id-ID")}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={file.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-500"
                  >
                    Lihat file
                  </a>
                  <form action="/api/karyawan/upload" method="POST">
                    <input type="hidden" name="action" value="delete-important" />
                    <input type="hidden" name="uploadId" value={file.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                    >
                      Hapus
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <p className="rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
            Belum ada file data penting.
          </p>
        )}
        <PaginationControls basePath="/dashboard/karyawan/data-penting" page={page} totalItems={totalFiles} />
      </div>
    </main>
  );
}
