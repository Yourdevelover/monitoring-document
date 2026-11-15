import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireManajer } from "@/lib/auth";
import { getUploadFileName } from "@/lib/upload-file";

const categories = [
  { key: "DAILY", slug: "daily", label: "Daily" },
  { key: "CHAT", slug: "chat", label: "Chat" },
  { key: "PAYMENT", slug: "payment", label: "Payment" },
  { key: "OTHER", slug: "other", label: "Berkas Lainnya" },
] as const;

export default async function ManagerFilesPage() {
  await requireManajer();
  const [counts, recentUploads] = await Promise.all([
    prisma.upload.groupBy({ by: ["category"], _count: { _all: true } }),
    prisma.upload.findMany({
      orderBy: { id: "desc" },
      take: 20,
      include: { user: true, team: { include: { department: true } } },
    }),
  ]);
  const categoryCounts = new Map(counts.map((row) => [row.category, row._count._all]));

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="border-b border-[#e5e7eb] pb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Seluruh departemen</p>
          <h1 className="mt-1 text-[15px] font-semibold">Berkas</h1>
        </header>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.key}
              href={`/dashboard/manajer/berkas/${category.slug}`}
              className="flex items-center justify-between border-b border-[#d1d5db] bg-white px-4 py-3 hover:bg-[#f8f9fa]"
            >
              <span className="text-xs font-medium">{category.label}</span>
              <strong className="text-lg">{categoryCounts.get(category.key) ?? 0}</strong>
            </Link>
          ))}
        </section>
        <section className="divide-y divide-[#e5e7eb] border-y border-[#d1d5db] bg-white">
          <h2 className="px-4 py-3 text-xs font-semibold uppercase">Berkas Terbaru</h2>
          {recentUploads.map((upload) => (
            <div key={upload.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-center">
              <div className="min-w-0">
                <a
                  href={upload.filePath}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-xs font-medium hover:underline"
                >
                  {getUploadFileName(upload.filePath)}
                </a>
                {upload.note && <p className="mt-1 whitespace-pre-wrap break-words text-xs text-[#374151]">Catatan: {upload.note}</p>}
              </div>
              <span className="truncate text-xs">{upload.user.name}</span>
              <span className="text-xs text-[#6b7280]">
                {upload.team.department.name} · {upload.category}
              </span>
              <time className="text-[11px] text-[#6b7280]">{upload.submissionDate?.toLocaleString("id-ID") ?? "Belum dikirim"}</time>
            </div>
          ))}
          {recentUploads.length === 0 && <p className="px-4 py-6 text-xs text-[#6b7280]">Belum ada berkas.</p>}
        </section>
      </div>
    </main>
  );
}
