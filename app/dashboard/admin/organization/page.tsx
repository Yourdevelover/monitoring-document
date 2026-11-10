import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export default async function OrganizationPage() {
  await requireAdmin();
  const departments = await prisma.department.findMany({
    include: { _count: { select: { teams: true } } },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <main className="space-y-4">
      <header className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Administrasi</p>
        <h1 className="mt-1 text-[15px] font-semibold tracking-tight">Kelola Departemen</h1>
        <p className="mt-1 text-xs text-[#6b7280]">Atur departemen untuk tim. Anggota dan Leader mengikuti departemen timnya.</p>
      </header>

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide">Daftar Departemen</h2>
            <p className="mt-1 text-[11px] text-[#6b7280]">Departemen yang digunakan tim tidak dapat dinonaktifkan.</p>
          </div>
          <span className="text-[11px] text-[#6b7280]">{departments.length} total</span>
        </div>

        <form action="/api/admin/departments" method="POST" className="mb-4 flex gap-2 border-b border-[#e5e7eb] pb-4">
          <input type="hidden" name="action" value="create" />
          <input name="name" required maxLength={80} placeholder="Nama departemen baru" className="h-9 min-w-0 flex-1 rounded-md border border-[#e5e7eb] px-3 text-xs" />
          <button type="submit" className="h-9 shrink-0 rounded-md bg-[#111111] px-3 text-xs font-medium text-white hover:bg-[#333333]">Tambah Departemen</button>
        </form>

        <div className="divide-y divide-[#f1f3f5]">
          {departments.map((department) => (
            <div key={department.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className={`truncate text-[13px] font-medium ${department.isActive ? "text-[#111111]" : "text-[#9ca3af]"}`}>{department.name}</p>
                <p className="mt-0.5 text-[11px] text-[#6b7280]">{department._count.teams} tim · {department.isActive ? "Aktif" : "Nonaktif"}</p>
              </div>
              <form action="/api/admin/departments" method="POST" className="shrink-0">
                <input type="hidden" name="action" value="toggle" />
                <input type="hidden" name="id" value={department.id} />
                <input type="hidden" name="isActive" value={String(!department.isActive)} />
                <button type="submit" disabled={department._count.teams > 0 && department.isActive} title={department._count.teams > 0 && department.isActive ? "Pindahkan tim terlebih dahulu" : undefined} className="rounded-md border border-[#e5e7eb] px-2.5 py-1.5 text-[11px] font-medium hover:bg-[#f8f9fa] disabled:cursor-not-allowed disabled:opacity-40">{department.isActive ? "Nonaktifkan" : "Aktifkan"}</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
