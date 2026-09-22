import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/auth";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";

const CATEGORY_KEYS = {
  "data-a": "DATA_A",
  "data-b": "DATA_B",
  "data-c": "DATA_C",
} as const;

type FileDetailPageProps = {
  params: Promise<{ category: string; id: string }>;
};

export default async function ManagerFileDetailPage({ params }: FileDetailPageProps) {
  const manager = await requireManager();
  const { category, id } = await params;
  const categoryKey = CATEGORY_KEYS[category as keyof typeof CATEGORY_KEYS];
  const uploadId = Number(id);

  const team = await prisma.team.findUnique({ where: { managerId: manager.id } });
  const upload = categoryKey && team && uploadId
    ? await prisma.upload.findFirst({
        where: {
          id: uploadId,
          teamId: team.id,
          category: categoryKey,
          isSubmitted: true,
        },
        include: { user: true },
      })
    : null;

  if (!upload) {
    return <p className="text-sm text-slate-600">Berkas tidak ditemukan.</p>;
  }

  return (
    <main className="min-h-screen text-slate-900">
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="mt-2 text-xl font-semibold">Pratinjau Berkas</h1>
        </div>

        <section className="space-y-2">
          <p className="text-lg font-semibold">{upload.fileName}</p>
          <p className="text-sm text-slate-600">Kategori: {upload.category.replace("DATA_", "Data ")}</p>
          <p className="text-sm text-slate-600">Karyawan: {upload.user.name}</p>
          <p className="text-xs text-slate-500">
            Dikirim: {new Date(upload.submissionDate).toLocaleString("id-ID")}
          </p>
          <a
            href={upload.filePath}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Lihat / Unduh Berkas
          </a>
        </section>

        <div className="flex justify-end">
          <BackToPreviousButton />
        </div>
      </div>
    </main>
  );
}
