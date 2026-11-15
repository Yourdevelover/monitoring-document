import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireManajer } from "@/lib/auth";
import { PaginationControls } from "@/app/components/pagination-controls";
import { getUploadFileName } from "@/lib/upload-file";

const categories = { daily: "DAILY", chat: "CHAT", payment: "PAYMENT", other: "OTHER" } as const;

export default async function ManagerCategoryPage({ params, searchParams }: { params: Promise<{ category: string }>; searchParams: Promise<{ q?: string; page?: string }> }) {
  await requireManajer();
  const { category } = await params;
  const selected = categories[category as keyof typeof categories];
  if (!selected) notFound();
  const { q, page: pageParam } = await searchParams;
  const search = q?.trim() ?? "";
  const pageSize = 15;
  const requestedPage = Math.max(1, Number(pageParam) || 1);
  const where = { category: selected, ...(search ? { OR: [{ filePath: { contains: search, mode: "insensitive" as const } }, { user: { name: { contains: search, mode: "insensitive" as const } } }] } : {}) };
  const totalItems = await prisma.upload.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const uploads = await prisma.upload.findMany({ where, include: { user: true, team: { include: { department: true } } }, orderBy: { id: "desc" }, skip: (page - 1) * pageSize, take: pageSize });

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[#e5e7eb] pb-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Berkas seluruh tim</p>
            <h1 className="mt-1 text-[15px] font-semibold">{selected}</h1>
          </div>
          <form method="GET" className="flex gap-2">
            <input name="q" type="search" defaultValue={search} placeholder="Cari file atau karyawan" className="rounded border border-[#d1d5db] px-3 py-2 text-xs" />
            <button className="rounded bg-[#111111] px-3 py-2 text-xs font-medium text-white">Cari</button>
          </form>
        </header>
        <section className="divide-y divide-[#e5e7eb] border-y border-[#d1d5db] bg-white">
          {uploads.map((upload) => (
            <article key={upload.id} className="grid gap-2 px-4 py-3 sm:grid-cols-[1.5fr_1fr_1fr_auto] sm:items-center">
              <a href={`/dashboard/manajer/berkas/${category}/${upload.id}`} className="truncate text-xs font-semibold hover:underline">
                {getUploadFileName(upload.filePath)}
              </a>
              <span className="truncate text-xs">{upload.user.name}</span>
              <span className="truncate text-xs text-[#6b7280]">
                {upload.team.department.name} · {upload.team.name}
              </span>
              <time className="text-[11px] text-[#6b7280]">{upload.submissionDate?.toLocaleString("id-ID") ?? "Belum dikirim"}</time>
            </article>
          ))}
          {uploads.length === 0 && (
            <p className="px-4 py-8 text-center text-xs text-[#6b7280]">Belum ada berkas pada kategori ini.</p>
          )}
        </section>
        <PaginationControls basePath={`/dashboard/manajer/berkas/${category}`} page={page} totalItems={totalItems} query={{ q: search || undefined }} />
      </div>
    </main>
  );
}
