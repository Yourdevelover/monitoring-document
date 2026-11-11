import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireManajer } from "@/lib/auth";

export default async function ManagerEmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireManajer();
  const { id } = await params;
  const employeeId = Number(id);
  const employee = Number.isInteger(employeeId) && employeeId > 0
    ? await prisma.user.findFirst({ where: { id: employeeId, role: "KARYAWAN" }, include: { department: true, team: { include: { department: true } } } })
    : null;
  if (!employee) return <p className="p-5 text-sm text-[#6b7280]">Karyawan tidak ditemukan.</p>;

  const [activities, latestUpload, uploads] = await Promise.all([
    prisma.activityLog.findMany({ where: { actorId: employee.id, action: { in: ["LOGIN", "LOGOUT", "UPLOAD_FILE", "SUBMIT_FILE"] } }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.upload.findFirst({ where: { userId: employee.id }, orderBy: { createdAt: "desc" }, select: { createdAt: true, fileName: true } }),
    prisma.upload.findMany({ where: { userId: employee.id }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  return (
    <main className="min-h-screen px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-4xl space-y-4">
        <header className="border-b border-[#e5e7eb] pb-3">
          <Link href="/dashboard/manajer/karyawan" className="text-xs font-semibold text-blue-700">← Semua karyawan</Link>
          <h1 className="mt-2 text-[15px] font-semibold">Informasi Karyawan</h1>
        </header>
        <section className="grid gap-3 border-y border-[#e5e7eb] bg-white p-4 sm:grid-cols-2">
          <Info label="Nama" value={employee.name} />
          <Info label="Email" value={employee.email} />
          <Info label="Departemen" value={employee.department?.name ?? employee.team?.department.name ?? "-"} />
          <Info label="Jabatan" value={employee.position ?? "-"} />
          <Info label="Tim" value={employee.team?.name ?? "Tanpa tim"} />
          <Info label="Status" value={employee.isActive} />
          <Info label="Bergabung" value={employee.createdAt.toLocaleDateString("id-ID")} />
          <Info label="Berkas terakhir" value={latestUpload ? `${latestUpload.fileName} · ${latestUpload.createdAt.toLocaleString("id-ID")}` : "Belum ada"} />
        </section>
        <section className="border-y border-[#e5e7eb] bg-white">
          <h2 className="border-b border-[#e5e7eb] px-4 py-3 text-xs font-semibold uppercase">Berkas</h2>
          {uploads.map((upload) => <a key={upload.id} href={upload.filePath} target="_blank" rel="noreferrer" className="flex justify-between gap-3 border-b border-[#f1f3f5] px-4 py-2.5 text-xs last:border-0"><span className="truncate">{upload.fileName}</span><span className="shrink-0 text-[#6b7280]">{upload.category} · {upload.createdAt.toLocaleDateString("id-ID")}</span></a>)}
          {uploads.length === 0 && <p className="px-4 py-5 text-xs text-[#6b7280]">Belum ada berkas.</p>}
        </section>
        <section className="border-y border-[#e5e7eb] bg-white">
          <h2 className="border-b border-[#e5e7eb] px-4 py-3 text-xs font-semibold uppercase">Aktivitas</h2>
          {activities.map((activity) => <div key={activity.id} className="flex justify-between gap-3 border-b border-[#f1f3f5] px-4 py-2.5 text-xs last:border-0"><span>{activity.description}</span><time className="shrink-0 text-[#6b7280]">{activity.createdAt.toLocaleString("id-ID")}</time></div>)}
          {activities.length === 0 && <p className="px-4 py-5 text-xs text-[#6b7280]">Belum ada aktivitas.</p>}
        </section>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[11px] text-[#6b7280]">{label}</p><p className="mt-1 break-words text-xs font-medium">{value}</p></div>;
}
