import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/auth";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";

const CATEGORY_KEYS = {
  "daily": "DAILY",
  "chat": "CHAT",
  "payment": "PAYMENT",
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
    return <p className="text-sm text-[#6b7280]">Berkas tidak ditemukan.</p>;
  }

  return (
    <main className="min-h-screen text-[#111111]">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="border-b border-[#e5e7eb] pb-4">
          <h1 className="text-base font-bold">Pratinjau Berkas</h1>
        </div>

        <section className="space-y-2">
          <p className="text-sm font-medium">{upload.fileName}</p>
          <p className="text-sm text-[#6b7280]">Kategori: {upload.category.toLowerCase()}</p>
          <p className="text-sm text-[#6b7280]">Karyawan: {upload.user.name}</p>
          <p className="text-xs text-[#6b7280]">
            Dikirim: {new Date(upload.submissionDate).toLocaleString("id-ID")}
          </p>
          <a
            href={upload.filePath}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex rounded-lg bg-[#111111] px-4 py-2 text-sm font-medium text-white hover:bg-[#333333]"
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
