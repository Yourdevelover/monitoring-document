import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/auth";
import Link from "next/link";
import { UploadForm } from "./upload-form";
import { FileConfirmationDialog } from "./file-confirmation-dialog";
import { FileActions } from "./file-actions";
import { getStartOfCurrentJakartaDay } from "@/lib/upload-time";

const CATEGORY_DETAILS = [
  {
    key: "DATA_A",
    label: "Data A",
    description: "Unggah file utama untuk Data A.",
  },
  {
    key: "DATA_B",
    label: "Data B",
    description: "Unggah file utama untuk Data B.",
  },
  {
    key: "DATA_C",
    label: "Data C",
    description: "Unggah file utama untuk Data C.",
  },
] as const;

export default async function EmployeeFilesPage() {
  const employee = await requireEmployee();

  const [managerSharedFiles, employeeUploads, importantFiles] = await Promise.all([
    prisma.upload.findMany({
      where: {
        teamId: employee.teamId ?? 0,
        user: {
          role: "MANAGER",
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.upload.findMany({
      where: {
        teamId: employee.teamId ?? 0,
        userId: employee.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.importantFile.findMany({
      where: { userId: employee.id },
    }),
  ]);

  const now = new Date();
  const startOfToday = getStartOfCurrentJakartaDay(now);
  const activeUploads = employeeUploads.filter(
    (upload) =>
      !upload.isImportant &&
      (!upload.isSubmitted || upload.submissionDate >= startOfToday)
  );
  const uploadedByCategory = new Map(
    activeUploads.map((upload) => [upload.category, upload])
  );
  const importantBySourceUpload = new Map(
    importantFiles.map((file) => [file.sourceUploadId, file.id])
  );
  return (
    <main className="min-h-screen text-slate-900">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="border-b border-slate-300 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Dokumen tim</p>
          <h1 className="mt-1 text-2xl font-bold">Berkas</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola berkas yang dibagikan manajer dan unggah dokumen Anda.</p>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Berkas dari Manajer</h2>
              <p className="text-sm text-slate-500">
                File yang dibagikan oleh manajer untuk diunduh oleh tim.
              </p>
            </div>
          </div>

          {managerSharedFiles.length > 0 ? (
            <div className="space-y-3">
              {managerSharedFiles.map((upload) => (
                <div key={upload.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium">{upload.title}</p>
                      <p className="text-sm text-slate-500">
                        {upload.fileName} • {upload.category} • oleh {upload.user.name}
                      </p>
                    </div>

                    <a
                      href={upload.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                    >
                      Unduh file
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600">Belum ada berkas yang dibagikan oleh manajer.</p>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Unggah Berkas</h2>
              <p className="text-sm text-slate-500">
                Jangan lupa untuk simpan data penting.
              </p>
            </div>
            <Link
              href="/dashboard/karyawan/histori-berkas"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              Histori Berkas →
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {CATEGORY_DETAILS.map((category) => {
              const uploadedFile = uploadedByCategory.get(category.key);

              return (
                <div key={category.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3">
                    <p className="text-sm font-medium uppercase tracking-[0.14em] text-slate-500">
                      {category.label}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">{category.label}</h3>
                    <p className="mt-1 text-sm text-slate-600">{category.description}</p>
                  </div>

                  {uploadedFile ? (
                    <div className="space-y-3 rounded-xl border-2 p-3" style={{
                      borderColor: uploadedFile.isSubmitted ? '#059669' : '#f59e0b',
                      backgroundColor: uploadedFile.isSubmitted ? '#ecfdf5' : '#fffbeb'
                    }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: uploadedFile.isSubmitted ? '#047857' : '#d97706' }}>
                          {uploadedFile.isSubmitted ? '✓ Sudah Dikirim' : '⏳ Belum Dikirim'}
                        </p>
                        <p className="text-xs" style={{ color: uploadedFile.isSubmitted ? '#10b981' : '#b45309' }}>
                          {uploadedFile.fileName}
                        </p>
                      </div>

                      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto">
                        <a
                          href={uploadedFile.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-500"
                        >
                          Lihat file
                        </a>
                        
                        {!uploadedFile.isSubmitted && (
                          <FileConfirmationDialog
                            uploadId={uploadedFile.id}
                            fileName={uploadedFile.fileName}
                            categoryKey={category.key}
                            isNewUpload={false}
                          />
                        )}
                        
                        {uploadedFile.isSubmitted && (
                          <FileActions
                            uploadId={uploadedFile.id}
                            isSubmitted={uploadedFile.isSubmitted}
                            isImportant={uploadedFile.isImportant}
                            importantSaved={uploadedFile.importantSaved}
                            importantFileId={
                              importantBySourceUpload.get(uploadedFile.id) ??
                              importantFiles.find((file) => file.category === uploadedFile.category)?.id
                            }
                          />
                        )}

                        {!uploadedFile.isSubmitted && (
                          <span className="inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
                            {uploadedFile.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-500">
                      Belum ada file untuk kategori ini.
                    </div>
                  )}

                  {!uploadedFile && (
                    <UploadForm
                      categoryKey={category.key}
                      categoryLabel={category.label}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
