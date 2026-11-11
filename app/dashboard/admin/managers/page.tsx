import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { UserManagementTabs } from "../user-management-tabs";
import { ConfirmActionForm } from "@/app/components/confirm-action-form";

export default async function AdminManagersPage() {
  await requireAdmin();
  const managers = await prisma.user.findMany({
    where: { role: "MANAJER" },
    include: { department: true },
    orderBy: { createdAt: "desc" },
  });
  const activeEmployeeCounts = await Promise.all(managers.map((manager) =>
    manager.departmentId
      ? prisma.user.count({
          where: {
            role: "KARYAWAN",
            isActive: "ACTIVE",
            OR: [
              { departmentId: manager.departmentId },
              { team: { departmentId: manager.departmentId } },
            ],
          },
        })
      : 0
  ));

  return (
    <main className="space-y-4">
      <UserManagementTabs activeRole="managers" />
      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xs font-semibold">Daftar Manajer</h2>
          <Link href="/dashboard/admin/managers/create" className="btn btn-primary">Tambah Manajer</Link>
        </div>
        {managers.length ? managers.map((manager, index) => (
          <div key={manager.id} className="grid gap-2 border-t border-[#e5e7eb] px-2 py-3 hover:bg-[#f8f9fa] sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] sm:items-center">
            <Link href={`/dashboard/admin/managers/${manager.id}`} className="min-w-0">
              <strong className="block truncate text-[13px]">{manager.name}</strong>
              <span className="block truncate text-xs text-[#6b7280]">{manager.email}</span>
            </Link>
            <span className="text-xs text-[#6b7280]">{manager.department?.name ?? "Belum diatur"}</span>
            <span className={`text-xs ${manager.isActive === "ACTIVE" ? "text-[#346538]" : "text-[#9f2f2d]"}`}>{manager.isActive === "ACTIVE" ? "Aktif" : "Nonaktif"}</span>
            <details className="relative justify-self-end">
              <summary className="flex h-8 cursor-pointer list-none items-center gap-2 rounded-md border border-[#e5e7eb] px-3 text-xs font-medium text-[#374151] hover:bg-white [&::-webkit-details-marker]:hidden">
                Aksi <span aria-hidden="true" className="text-[10px]">▾</span>
              </summary>
              <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-[#e5e7eb] bg-white p-1.5 shadow-lg">
                <Link href={`/dashboard/admin/managers/${manager.id}`} className="flex h-8 items-center rounded px-2 text-xs hover:bg-[#f8f9fa]">Lihat detail</Link>
                {manager.isActive === "ACTIVE" && activeEmployeeCounts[index] > 0 ? (
                  <p className="px-2 py-2 text-[11px] leading-snug text-[#9f2f2d]">Tidak bisa dinonaktifkan: {activeEmployeeCounts[index]} karyawan aktif di departemen.</p>
                ) : (
                  <ConfirmActionForm action="/api/admin/managers/action" confirmMessage={`Yakin ingin ${manager.isActive === "ACTIVE" ? "menonaktifkan" : "mengaktifkan"} akun ${manager.name}?`}>
                    <input type="hidden" name="userId" value={manager.id} />
                    <input type="hidden" name="action" value={manager.isActive === "ACTIVE" ? "deactivate" : "activate"} />
                    <button type="submit" className={`flex h-8 w-full items-center rounded px-2 text-left text-xs ${manager.isActive === "ACTIVE" ? "text-[#9f2f2d] hover:bg-red-50" : "text-[#346538] hover:bg-green-50"}`}>
                      {manager.isActive === "ACTIVE" ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </ConfirmActionForm>
                )}
              </div>
            </details>
          </div>
        )) : <p className="py-8 text-center text-sm text-[#6b7280]">Belum ada akun manajer.</p>}
      </section>
    </main>
  );
}
