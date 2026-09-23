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
    key: "DAILY",
    label: "daily",
    description: "Unggah file utama untuk daily.",
  },
  {
    key: "CHAT",
    label: "chat",
    description: "Unggah file utama untuk chat.",
  },
  {
    key: "PAYMENT",
    label: "payment",
    description: "Unggah file utama untuk payment.",
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
  // group all uploads per category (multi-file for CHAT/PAYMENT, single for DAILY)
  const uploadsByCategory = new Map<string, typeof employeeUploads>();
  for (const upload of employeeUploads) {
    const list = uploadsByCategory.get(upload.category) ?? [];
    list.push(upload);
    uploadsByCategory.set(upload.category, list);
  }
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
              const categoryUploads = uploadsByCategory.get(category.key) ?? [];
              const isMulti = category.key !== "DAILY";
              const uploadedFile = categoryUploads[0];

              return (
                <div key={category.key} className="rounded-md border border-[#e5e7eb] bg-[#f8f9fa] p-3">
                  <div className="mb-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                      {category.label}
                    </p>
                    <p className="mt-0.5 text-xs text-[#6b7280]">{category.description}</p>
                  </div>

                  {isMulti && (
                    <UploadForm
                      categoryKey={category.key}
                      categoryLabel={category.label}
                    />
                  )}
                  {!isMulti && !uploadedFile && (
                    <UploadForm
                      categoryKey={category.key}
                      categoryLabel={category.label}
                    />
                  )}
                  {!isMulti && uploadedFile && (
                    <div className="rounded-md bg-white p-2.5 text-xs text-[#6b7280]">
                      File daily sudah dikirim hari ini. Kelola di daftar berkas di bawah.
                    </div>
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

        <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[#111111]">Daftar Berkas Saya</h2>
              <p className="mt-0.5 text-xs text-[#6b7280]">Kelola file: lihat, kirim, ganti, hapus, atau simpan ke data penting.</p>
            </div>
            <span className="text-[11px] text-[#6b7280]">{employeeUploads.length} file</span>
          </div>

          {employeeUploads.length > 0 ? (
            <div className="mt-3 space-y-2.5">
              {employeeUploads.map((uploadedFile) => (
                <div key={uploadedFile.id} className="flex flex-col gap-2.5 rounded-md p-3 sm:flex-row sm:items-center sm:justify-between" style={{
                  backgroundColor: uploadedFile.isSubmitted ? '#edf3ec' : '#fbf3db'
                }}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#6b7280]">
                        {uploadedFile.category.toLowerCase()}
                      </span>
                      <p className="text-[13px] font-semibold" style={{ color: uploadedFile.isSubmitted ? '#346538' : '#956400' }}>
                        {uploadedFile.isSubmitted ? '✓ Sudah Dikirim' : '⏳ Belum Dikirim'}
                      </p>
                    </div>
                    <p className="mt-1 truncate text-xs" style={{ color: uploadedFile.isSubmitted ? '#4a7a4e' : '#a06a00' }}>
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
                        categoryKey={uploadedFile.category as "DAILY" | "CHAT" | "PAYMENT"}
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
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-md bg-[#f8f9fa] p-4 text-center text-xs text-[#6b7280]">
              Belum ada berkas. Gunakan form di atas untuk mengunggah.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
