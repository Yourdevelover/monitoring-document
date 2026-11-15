import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/auth";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";
import { getStartOfCurrentJakartaDay } from "@/lib/upload-time";
import { PaginationControls } from "@/app/components/pagination-controls";
import { getUploadFileName } from "@/lib/upload-file";

export default async function HistoriBerkasPage({ searchParams }: { searchParams: Promise<{ page?: string; expiredPage?: string }> }) {
  const employee = await requireEmployee();
  const params = await searchParams;
  const pageSize = 20;
  const requestedPage = Math.max(1, Number(params.page) || 1);
  const requestedExpiredPage = Math.max(1, Number(params.expiredPage) || 1);

  const submittedFiles = (await prisma.upload.findMany({
    where: {
      userId: employee.id,
      submissionDate: { not: null },
      isImportant: false,
    },
    orderBy: { submissionDate: "desc" },
  })).filter((file) => file.submissionDate !== null);

  // Filter expired files (not important)
  const now = new Date();
  const startOfToday = getStartOfCurrentJakartaDay(now);
  const validSubmittedFiles = submittedFiles.filter(
    (file) => file.submissionDate !== null && file.submissionDate >= startOfToday && file.submissionDate.getTime() + 12 * 60 * 60 * 1000 > now.getTime()
  );
  const expiredFiles = submittedFiles.filter(
    (file) => file.submissionDate !== null && (file.submissionDate < startOfToday || file.submissionDate.getTime() + 12 * 60 * 60 * 1000 <= now.getTime())
  );
  const totalPages = Math.max(1, Math.ceil(validSubmittedFiles.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const totalExpiredPages = Math.max(1, Math.ceil(expiredFiles.length / pageSize));
  const expiredPage = Math.min(requestedExpiredPage, totalExpiredPages);
  const visibleValidFiles = validSubmittedFiles.slice((page - 1) * pageSize, page * pageSize);
  const visibleExpiredFiles = expiredFiles.slice((expiredPage - 1) * pageSize, expiredPage * pageSize);

  return (
    <main className="min-h-screen text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-[#e5e7eb] pb-3">
            <div>
              <h2 className="text-base font-semibold">Histori Berkas (12 Jam)</h2>
              <p className="text-xs text-[#6b7280]">
                File yang sudah dikirim tersimpan selama 12 jam.
              </p>
            </div>
          </div>

          {validSubmittedFiles.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visibleValidFiles.map((file) => {
                const expiresIn = Math.ceil((file.submissionDate!.getTime() + 12 * 60 * 60 * 1000 - now.getTime()) / (60 * 60 * 1000));

                return (
                  <article key={file.id} className="flex min-h-48 flex-col border-t-2 border-emerald-300 py-4">
                    <div>
                      <p className="font-medium text-emerald-900">{getUploadFileName(file.filePath)}</p>
                      <p className="mt-1 break-words text-sm text-[#346538]">
                        {file.category}
                      </p>
                      {file.note && <p className="mt-1 whitespace-pre-wrap break-words text-xs text-[#4a7a4e]">Catatan: {file.note}</p>}
                      <p className="mt-1 text-xs text-emerald-600">
                        Dikirim {file.submissionDate!.toLocaleDateString("id-ID")} • Berlaku {expiresIn} jam lagi
                      </p>
                    </div>

                    <div className="mt-auto flex flex-wrap gap-2 pt-4">
                        <a
                          href={file.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-lg bg-[#346538] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d5a30]"
                        >
                          Unduh
                        </a>
                        <form
                          action="/api/karyawan/upload"
                          method="POST"
                          className="inline-flex"
                        >
                          <input type="hidden" name="action" value="add-important" />
                          <input type="hidden" name="uploadId" value={file.id} />
                          <button
                            type="submit"
                            className="inline-flex items-center rounded-lg border border-[#e8d9a8] bg-[#fbf3db] px-4 py-2 text-sm font-medium text-[#956400] hover:bg-[#fbf3db]"
                          >
                            Simpan ke Data Prioritas
                          </button>
                        </form>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="border-y border-dashed border-[#e5e7eb] px-4 py-5 text-center">
              <p className="text-sm font-semibold text-[#111111]">Belum ada histori berkas</p>
              <p className="mt-1 text-sm text-[#6b7280]">Kirim file dari halaman Berkas untuk menambah histori.</p>
            </div>
          )}
          <PaginationControls basePath="/dashboard/karyawan/histori-berkas" page={page} totalItems={validSubmittedFiles.length} query={{ expiredPage: params.expiredPage }} />
        </section>

        {/* Expired Files Section */}
        {expiredFiles.length > 0 && (
          <section>
            <div className="mb-4 border-b border-[#e5e7eb] pb-3">
              <h2 className="text-base font-semibold">Berkas Kadaluarsa</h2>
              <p className="text-xs text-[#6b7280]">
                File berikut telah melampaui batas waktu 12 jam dan tidak dapat diunduh lagi.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visibleExpiredFiles.map((file) => (
                <div key={file.id} className="border-t border-[#e5e7eb] py-4 opacity-60">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-[#6b7280]">{getUploadFileName(file.filePath)}</p>
                      <p className="text-sm text-[#6b7280]">
                        {file.category} • Kadaluarsa pada {new Date(file.submissionDate!.getTime() + 12 * 60 * 60 * 1000).toLocaleDateString('id-ID')}
                      </p>
                    </div>

                    <p className="text-sm font-medium text-[#6b7280]">
                      ✓ Berkas telah dihapus
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <PaginationControls basePath="/dashboard/karyawan/histori-berkas" page={expiredPage} totalItems={expiredFiles.length} query={{ expiredPage: String(expiredPage) }} />
          </section>
        )}
      </div>

      <div className="mx-auto mt-4 max-w-7xl flex justify-end pb-6">
        <BackToPreviousButton />
      </div>
    </main>
  );
}
