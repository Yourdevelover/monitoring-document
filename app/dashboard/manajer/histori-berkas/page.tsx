import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/auth";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";

const categories = [
  { key: "DAILY", label: "daily" },
  { key: "CHAT", label: "chat" },
  { key: "PAYMENT", label: "payment" },
] as const;

type CategoryKey = (typeof categories)[number]["key"];

function getDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function formatDate(dateKey: string) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "full",
  }).format(new Date(`${dateKey}T00:00:00+07:00`));
}

export default async function ManagerHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; date?: string }>;
}) {
  const manager = await requireManager();
  const params = await searchParams;
  const selectedCategory = categories.some((category) => category.key === params.category)
    ? (params.category as CategoryKey)
    : null;
  const selectedDate = /^\d{4}-\d{2}-\d{2}$/.test(params.date ?? "") ? params.date ?? null : null;
  const team = await prisma.team.findUnique({ where: { managerId: manager.id } });
  const submittedFiles = team
    ? await prisma.uploadHistory.findMany({
        where: {
          teamId: team.id,
          ...(selectedCategory ? { category: selectedCategory } : {}),
        },
        include: { user: true },
        orderBy: { submittedAt: "desc" },
      })
    : [];

  const selectedFiles = selectedDate
    ? submittedFiles.filter((file) => getDateKey(file.submittedAt) === selectedDate)
    : [];
  const selectedCategoryLabel = categories.find((category) => category.key === selectedCategory)?.label;

  return (
    <main className="min-h-screen text-slate-900">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Riwayat tim</p>
            <h1 className="mt-1 text-base font-semibold">Histori Berkas</h1>
            <p className="mt-1 text-xs text-slate-500">Pilih kategori dan tanggal untuk melihat berkas yang masuk.</p>
          </div>
          {selectedCategory && (
            <a href="/dashboard/manajer/histori-berkas" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
              Semua tanggal
            </a>
          )}
        </header>

        {selectedCategory && selectedDate ? (
          <section className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{selectedCategoryLabel}</p>
                  <h2 className="mt-1 text-sm font-semibold">{formatDate(selectedDate)}</h2>
                </div>
                <a
                  href={`/api/manajer/berkas/download?category=${selectedCategory}&history=true&date=${selectedDate}`}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
                >
                  Unduh Semua
                </a>
              </div>
            </div>
            {selectedFiles.length > 0 ? (
              <div className="divide-y divide-slate-200 border-y border-slate-300">
                {selectedFiles.map((file) => (
                  <div key={file.id} className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <a href={file.filePath} target="_blank" rel="noopener noreferrer" className="min-w-0 hover:bg-slate-50">
                      <p className="truncate font-medium text-slate-900" title={file.fileName}>{file.fileName}</p>
                      <p className="truncate text-sm text-slate-600">{file.user.name}</p>
                      <p className="text-xs text-slate-500">Dikirim {file.submittedAt.toLocaleString("id-ID")}</p>
                    </a>
                    <a href={file.filePath} download={file.fileName} className="whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700">
                      Unduh
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="border-y border-dashed border-slate-300 py-6 text-center text-sm text-slate-500">Belum ada berkas pada tanggal ini.</p>
            )}
          </section>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {categories.map((category) => {
              const categoryDates = submittedFiles.filter((file) => file.category === category.key);
              const groupedDates = new Map<string, number>();
              for (const file of categoryDates) {
                const dateKey = getDateKey(file.submittedAt);
                groupedDates.set(dateKey, (groupedDates.get(dateKey) ?? 0) + 1);
              }
              const categoryDateEntries = [...groupedDates.entries()].sort(([first], [second]) => second.localeCompare(first));

              return (
                <section key={category.key} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
                    <h2 className="text-sm font-semibold text-slate-800">{category.label}</h2>
                  </div>
                  {categoryDateEntries.length > 0 ? (
                    <div className="space-y-2">
                      {categoryDateEntries.map(([dateKey, count]) => (
                        <a key={dateKey} href={`/dashboard/manajer/histori-berkas?category=${category.key}&date=${dateKey}`} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:border-blue-300 hover:bg-blue-50">
                          <span className="text-sm font-medium text-slate-800">{formatDate(dateKey)}</span>
                          <span className="text-xs text-slate-500">{count} file</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-xs text-slate-500">Belum ada tanggal upload.</p>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>

      <div className="mx-auto mt-4 flex max-w-7xl justify-end pb-6">
        <BackToPreviousButton />
      </div>
    </main>
  );
}
