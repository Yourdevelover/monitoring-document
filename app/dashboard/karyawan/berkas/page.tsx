import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/auth";
import Link from "next/link";
import { UploadForm } from "./upload-form";
import { FileConfirmationDialog } from "./file-confirmation-dialog";
import { FileActions } from "./file-actions";
import { getStartOfCurrentJakartaDay } from "@/lib/upload-time";
import { ManagerFilePopover } from "./manager-file-popover";

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
        <header className="pb-4">
          <h1 className="mt-1 text-2xl font-bold">Berkas dari Manajer</h1>
          <p className="mt-1 text-sm text-slate-500">
            File yang dibagikan oleh manajer untuk diunduh oleh tim.
          </p>

          {managerSharedFiles.length > 0 ? (
            <div className="mt-2 grid max-w-md gap-1.5 sm:grid-cols-2">
              {managerSharedFiles.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between gap-2 bg-slate-50 px-2.5 py-1.5">
                  <div className="min-w-0 max-w-[130px]">
                    <p className="truncate text-sm font-medium text-slate-700">{upload.title}</p>
                    <p className="truncate text-xs text-slate-500">{upload.fileName}</p>
                  </div>
                  <ManagerFilePopover
                    file={{
                      id: upload.id,
                      title: upload.title,
                      fileName: upload.fileName,
                      category: upload.category,
                      filePath: upload.filePath,
                      uploaderName: upload.user.name ?? "Manajer",
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-slate-600">Belum ada berkas yang dibagikan oleh manajer.</p>
          )}
        </header>

        <section className="rounded-2xl bg-white px-6 pb-6 pt-2 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-3">
            {CATEGORY_DETAILS.map((category) => {
              const uploadedFile = uploadedByCategory.get(category.key);

              return (
                <div key={category.key} className="bg-slate-50 p-4">
                  <div className="mb-3">
                    <p className="text-sm font-medium uppercase tracking-[0.14em] text-slate-500">
                      {category.label}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{category.description}</p>
                  </div>

                  {uploadedFile ? (
                    <div className="space-y-3 p-3" style={{
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
                    <div className="bg-white p-3 text-sm text-slate-500">
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

          <div className="mt-6 border-t border-slate-200 pt-4 flex items-end justify-between">
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
        </section>
      </div>
    </main>
  );
}
