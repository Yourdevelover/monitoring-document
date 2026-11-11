import { prisma } from "@/lib/prisma";
import { requireManajer } from "@/lib/auth";

const categories = ["DAILY", "CHAT", "PAYMENT", "OTHER"] as const;
function dateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default async function ManagerFileHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; date?: string }>;
}) {
  await requireManajer();
  const params = await searchParams;
  const category = categories.find((value) => value === params.category);
  const selectedDate = /^\d{4}-\d{2}-\d{2}$/.test(params.date ?? "")
    ? params.date
    : null;
  const files = await prisma.uploadHistory.findMany({
    where: category ? { category } : {},
    include: {
      user: true,
      team: { include: { department: true } },
    },
    orderBy: { submittedAt: "desc" },
  });
  const filtered = selectedDate
    ? files.filter((file) => dateKey(file.submittedAt) === selectedDate)
    : files;
  const dates = [...new Set(files.map((file) => dateKey(file.submittedAt)))];

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="border-b border-[#e5e7eb] pb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
            Lintas tim
          </p>
          <h1 className="mt-1 text-[15px] font-semibold">Histori Berkas</h1>
        </header>
        <form method="GET" className="flex flex-wrap gap-2">
          <select
            name="category"
            defaultValue={category ?? ""}
            className="rounded border border-[#d1d5db] bg-white px-3 py-2 text-xs"
          >
            <option value="">Semua kategori</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            name="date"
            defaultValue={selectedDate ?? ""}
            className="rounded border border-[#d1d5db] bg-white px-3 py-2 text-xs"
          >
            <option value="">Semua tanggal</option>
            {dates.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button className="rounded bg-[#111111] px-3 py-2 text-xs font-medium text-white">
            Tampilkan
          </button>
        </form>
        <section className="divide-y divide-[#e5e7eb] border-y border-[#d1d5db] bg-white">
          {filtered.map((file) => (
            <a
              key={file.id}
              href={file.filePath}
              target="_blank"
              rel="noreferrer"
              className="grid gap-1 px-4 py-3 hover:bg-[#f8f9fa] sm:grid-cols-[1.5fr_1fr_1fr_auto] sm:items-center"
            >
              <span className="truncate text-xs font-semibold">
                {file.fileName}
              </span>
              <span className="truncate text-xs">{file.user.name}</span>
              <span className="truncate text-xs text-[#6b7280]">
                {file.team.department.name} · {file.category}
              </span>
              <time className="text-[11px] text-[#6b7280]">
                {file.submittedAt.toLocaleString("id-ID")}
              </time>
            </a>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-xs text-[#6b7280]">
              Tidak ada histori berkas.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
