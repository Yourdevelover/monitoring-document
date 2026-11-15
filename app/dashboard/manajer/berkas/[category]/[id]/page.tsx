import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireManajer } from "@/lib/auth";
import { getUploadFileName } from "@/lib/upload-file";

const categories = { daily: "DAILY", chat: "CHAT", payment: "PAYMENT", other: "OTHER" } as const;

export default async function ManagerFileDetailPage({ params }: { params: Promise<{ category: string; id: string }> }) {
  await requireManajer();
  const { category, id } = await params;
  const selected = categories[category as keyof typeof categories];
  const uploadId = Number(id);
  if (!selected || !Number.isInteger(uploadId) || uploadId <= 0) notFound();
  const upload = await prisma.upload.findFirst({ where: { id: uploadId, category: selected }, include: { user: true, team: { include: { department: true } } } });
  if (!upload) notFound();

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-3xl space-y-4">
        <header className="border-b border-[#e5e7eb] pb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Informasi berkas</p>
          <h1 className="mt-1 break-words text-[15px] font-semibold">{getUploadFileName(upload.filePath)}</h1>
        </header>
        <section className="grid gap-3 border-y border-[#d1d5db] bg-white p-4 sm:grid-cols-2">
          <Info label="Karyawan" value={upload.user.name} />
          <Info label="Email" value={upload.user.email} />
          <Info label="Departemen" value={upload.team.department.name} />
          <Info label="Tim" value={upload.team.name} />
          <Info label="Kategori" value={upload.category} />
          <Info label="Status" value={upload.status} />
          <Info label="Dikirim" value={upload.submissionDate?.toLocaleString("id-ID") ?? "Belum dikirim"} />
        </section>
        <a
          href={upload.filePath}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded bg-[#111111] px-4 py-2 text-xs font-semibold text-white"
        >
          Lihat / Unduh
        </a>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-[#6b7280]">{label}</p>
      <p className="mt-1 break-words text-xs font-medium">{value}</p>
    </div>
  );
}
