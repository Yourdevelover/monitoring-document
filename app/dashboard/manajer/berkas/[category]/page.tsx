import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/auth";
import { EmployeeProfileCard } from "../../employee-profile-card";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";
import { getStartOfCurrentJakartaDay } from "@/lib/upload-time";
import { PaginationControls } from "@/app/components/pagination-controls";

const CATEGORY_LABELS = {
  "data-a": { key: "DATA_A", label: "Berkas A" },
  "data-b": { key: "DATA_B", label: "Berkas B" },
  "data-c": { key: "DATA_C", label: "Berkas C" },
} as const;

type CategoryPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ employee?: string; q?: string; page?: string }>;
};

export default async function ManagerCategoryPage({ params, searchParams }: CategoryPageProps) {
  const manager = await requireManager();
  const { category } = await params;
  const { employee: selectedEmployeeId, q, page: pageParam } = await searchParams;
  const pageSize = 6;
  const requestedPage = Math.max(1, Number(pageParam) || 1);
  const searchTerm = q?.trim() ?? "";
  const startOfToday = getStartOfCurrentJakartaDay();
  const categoryInfo = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS];

  if (!categoryInfo) {
    return <p className="text-sm text-slate-600">Kategori berkas tidak ditemukan.</p>;
  }

  const team = await prisma.team.findUnique({
    where: { managerId: manager.id },
    include: {
      uploads: {
        where: {
          category: categoryInfo.key,
          isSubmitted: true,
          isImportant: false,
          submissionDate: { gte: startOfToday },
          ...(searchTerm
            ? {
                OR: [
                  { fileName: { contains: searchTerm, mode: "insensitive" as const } },
                  { user: { name: { contains: searchTerm, mode: "insensitive" as const } } },
                ],
              }
            : {}),
        },
        include: { user: true },
        orderBy: { submissionDate: "desc" },
      },
    },
  });
  const uploads = team?.uploads ?? [];
  const allTeamUploads = team
    ? await prisma.upload.findMany({
        where: {
          teamId: team.id,
          isSubmitted: true,
          isImportant: false,
          submissionDate: { gte: startOfToday },
        },
        orderBy: { submissionDate: "desc" },
      })
    : [];
  const uploadsByEmployee = new Map<number, typeof allTeamUploads>();
  for (const upload of allTeamUploads) {
    const employeeUploads = uploadsByEmployee.get(upload.userId) ?? [];
    employeeUploads.push(upload);
    uploadsByEmployee.set(upload.userId, employeeUploads);
  }
  const selectedEmployee = uploads.find((upload) => String(upload.userId) === selectedEmployeeId)?.user;
  const visibleUploads = selectedEmployee
    ? uploads.filter((upload) => upload.userId === selectedEmployee.id)
    : uploads;
  const totalPages = Math.max(1, Math.ceil(visibleUploads.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const pagedUploads = visibleUploads.slice((page - 1) * pageSize, page * pageSize);
  const formatDateTime = (date: Date) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);

  return (
    <main className="min-h-screen text-slate-900">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h1 className="mt-2 text-xl font-semibold">{categoryInfo.label}</h1>
            <p className="mt-1 text-sm text-slate-500">Berkas yang diterima dalam 12 jam terakhir.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <form method="GET" className="flex items-center gap-2">
              <label htmlFor="file-search" className="sr-only">Cari berkas atau karyawan</label>
              <input
                id="file-search"
                name="q"
                type="search"
                defaultValue={searchTerm}
                placeholder="Cari berkas atau karyawan"
                className="w-56 border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
              <button type="submit" className="border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
                Cari
              </button>
            </form>
            <a
              href={`/api/manajer/berkas/download?category=${categoryInfo.key}`}
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
            >
              Unduh semua
            </a>
          </div>
        </div>

        {visibleUploads.length > 0 ? (
          <div className="max-h-[680px] divide-y divide-slate-200 overflow-x-auto overflow-y-auto border-y border-slate-200">
            {pagedUploads.map((upload) => (
              <article key={upload.id} className="grid min-w-[620px] grid-cols-[36px_minmax(0,1fr)_max-content_auto] items-center gap-3 py-3">
                <EmployeeProfileCard
                  employee={upload.user}
                  files={uploadsByEmployee.get(upload.userId)?.map((file) => ({
                    id: file.id,
                    fileName: file.fileName,
                    filePath: file.filePath,
                    category: file.category,
                    status: file.status,
                    isSubmitted: file.isSubmitted,
                    submissionDate: file.submissionDate,
                    expiresAt: file.expiresAt,
                  }))}
                />
                <p className="min-w-0 truncate font-semibold text-slate-900" title={upload.fileName}>{upload.fileName}</p>
                <p className="whitespace-nowrap text-xs text-slate-500">{formatDateTime(upload.submissionDate)}</p>
                <div className="flex items-center gap-2">
                  <a
                    href={upload.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Lihat
                  </a>
                  <a
                    href={upload.filePath}
                    download={upload.fileName}
                    className="whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
                  >
                    Unduh
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="border-y border-dashed border-slate-300 py-8 text-center text-sm text-slate-600">
            {searchTerm ? `Tidak ada hasil untuk "${searchTerm}".` : "Belum ada berkas masuk pada kategori ini."}
          </p>
        )}
        <PaginationControls basePath={`/dashboard/manajer/berkas/${category}`} page={page} totalItems={visibleUploads.length} query={{ employee: selectedEmployeeId, q: searchTerm || undefined }} />
      </div>

      <div className="flex justify-end pb-6">
        <BackToPreviousButton />
      </div>
    </main>
  );
}
