import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";

export default async function ManagerHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const manager = await prisma.user.findFirst({
    where: { id: Number(id), role: "MANAGER" },
    include: { managedTeam: true },
  });
  if (!manager) return <p className="p-4 text-sm text-slate-600">Manajer tidak ditemukan.</p>;

  const files = manager.managedTeam
    ? await prisma.uploadHistory.findMany({
      where: { teamId: manager.managedTeam.id },
        include: { user: true },
      orderBy: { submittedAt: "desc" },
      })
    : [];

  return (
    <main className="space-y-5 p-4 text-slate-900">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-300 pb-4">
        <div>
          <h1 className="mt-2 text-xl font-semibold">Histori Berkas {manager.name}</h1>
        </div>
        <span className="text-xs text-slate-500">{files.length} file</span>
      </header>
      <div className="divide-y divide-slate-200 border-y border-slate-300">
        {files.length > 0 ? files.map((file) => (
          <a
            key={file.id}
            href={file.filePath}
            target="_blank"
            rel="noopener noreferrer"
            className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] hover:bg-slate-50"
          >
            <span className="truncate font-medium" title={file.fileName}>{file.fileName}</span>
            <span className="truncate text-sm text-slate-600">{file.user.name} • {file.category}</span>
            <span className="text-xs text-slate-500">{file.submittedAt.toLocaleString("id-ID")}</span>
          </a>
        )) : <p className="py-8 text-center text-sm text-slate-500">Belum ada histori berkas.</p>}
      </div>

      <div className="flex justify-end">
        <BackToPreviousButton />
      </div>
    </main>
  );
}
