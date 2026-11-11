import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";

export default async function LeaderHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const leader = await prisma.user.findFirst({
    where: { id: Number(id), role: "MANAJER" },
    include: { ledTeam: true },
  });
  if (!leader) return <p className="p-4 text-sm text-[#6b7280]">Leader tidak ditemukan.</p>;

  const files = leader.ledTeam
    ? await prisma.uploadHistory.findMany({
      where: { teamId: leader.ledTeam.id },
        include: { user: true },
      orderBy: { submittedAt: "desc" },
      })
    : [];

  return (
    <main className="space-y-4 p-4 text-[#111111]">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[#e5e7eb] pb-4">
        <div>
          <h1 className="text-base font-bold">Histori Berkas {leader.name}</h1>
        </div>
        <span className="text-xs text-[#6b7280]">{files.length} file</span>
      </header>
      <div className="divide-y divide-slate-200 border-y border-[#e5e7eb]">
        {files.length > 0 ? files.map((file) => (
          <a
            key={file.id}
            href={file.filePath}
            target="_blank"
            rel="noopener noreferrer"
            className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] hover:bg-[#f8f9fa]"
          >
            <span className="truncate font-medium" title={file.fileName}>{file.fileName}</span>
            <span className="truncate text-sm text-[#6b7280]">{file.user.name} • {file.category}</span>
            <span className="text-xs text-[#6b7280]">{file.submittedAt.toLocaleString("id-ID")}</span>
          </a>
        )) : <p className="py-8 text-center text-sm text-[#6b7280]">Belum ada histori berkas.</p>}
      </div>

      <div className="flex justify-end">
        <BackToPreviousButton />
      </div>
    </main>
  );
}
