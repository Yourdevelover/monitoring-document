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

// Ensure fresh data on each request; avoids stale UI after upload/submit
export const dynamic = "force-dynamic";

export default async function EmployeeFilesPage() {
  const employee = await requireEmployee();
  const startOfToday = getStartOfCurrentJakartaDay(new Date());

  const [managerSharedFiles, employeeUploads, importantFiles] = await Promise.all([
    prisma.upload.findMany({
      where: {
        teamId: employee.teamId ?? 0,
        user: {
          role: "MANAGER",
        },
        isSubmitted: true,
        isImportant: false,
        submissionDate: { gte: startOfToday },
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

  // Exclude uploads that have been submitted today; keep only pending or older submissions
  // pending uploads (not submitted today) – used to block new uploads for same day
  const activeUploads = employeeUploads.filter(
    (upload) =>
      !upload.isImportant &&
      (!upload.isSubmitted || (upload.submissionDate && upload.submissionDate < startOfToday))
  );
  // map all uploads (including submitted) for display
  const uploadedByCategory = new Map(
    employeeUploads.map((upload) => [upload.category, upload])
  );
  const importantBySourceUpload = new Map(
    importantFiles.map((file) => [file.sourceUploadId, file.id])
  );
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Monitoring</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="text-[15px] font-semibold tracking-tight">Berkas dari Manajer</h1>
            <span className="rounded-md bg-[#e1f3fe] px-2 py-1 text-xs font-medium text-[#1f6c9f]">{managerSharedFiles.length} file dibagikan</span>
          </div>
          <p className="mt-1 text-xs text-[#6b7280]">File yang dibagikan oleh manajer untuk diunduh oleh tim.</p>

          {managerSharedFiles.length > 0 && (
            <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {managerSharedFiles.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between gap-2 rounded-md bg-[#f8f9fa] px-2.5 py-1.5">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-[#111111]">{upload.title}</p>
                    <p className="truncate text-xs text-[#6b7280]">{upload.fileName}</p>
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
          )}
        </header>

        <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-3">
            {CATEGORY_DETAILS.map((category) => {
              const uploadedFile = uploadedByCategory.get(category.key);

              return (
                <div key={category.key} className="rounded-md border border-[#e5e7eb] bg-[#f8f9fa] p-3">
                  <div className="mb-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                      {category.label}
                    </p>
                    <p className="mt-0.5 text-xs text-[#6b7280]">{category.description}</p>
                  </div>

                  {uploadedFile ? (
                    <div className="space-y-2.5 rounded-md p-2.5" style={{
                      backgroundColor: uploadedFile.isSubmitted ? '#edf3ec' : '#fbf3db'
                    }}>
                      <div>
                        <p className="text-[13px] font-semibold" style={{ color: uploadedFile.isSubmitted ? '#346538' : '#956400' }}>
                          {uploadedFile.isSubmitted ? '✓ Sudah Dikirim' : '⏳ Belum Dikirim'}
                        </p>
                        <p className="mt-0.5 truncate text-xs" style={{ color: uploadedFile.isSubmitted ? '#4a7a4e' : '#a06a00' }}>
                          {uploadedFile.fileName}
                        </p>
                      </div>

                      <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto">
                        <a
                          href={uploadedFile.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-md bg-[#111111] px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-[#333333]"
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
                          <span className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#111111]">
                            {uploadedFile.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-md bg-white p-2.5 text-xs text-[#6b7280]">
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

          <div className="mt-4 flex items-end justify-between border-t border-[#e5e7eb] pt-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[#111111]">Unggah Berkas</h2>
              <p className="mt-0.5 text-xs text-[#6b7280]">Jangan lupa untuk simpan data penting.</p>
            </div>
            <Link
              href="/dashboard/karyawan/histori-berkas"
              className="text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
            >
              Histori Berkas →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
