import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";
import { EmployeeCreateForm } from "./employee-create-form";

export default async function CreateEmployeePage() {
  await requireAdmin();

  const leaders = await prisma.user.findMany({
    where: { role: "LEADER", isActive: "ACTIVE" },
    include: { department: true, ledTeam: { include: { department: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <main className="space-y-4">
      <header className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Manajemen akun</p>
        <h1 className="mt-1 text-[13px] font-semibold tracking-tight">Tambah Karyawan</h1>
        <p className="mt-1 text-xs text-[#6b7280]">Pilih Leader. Departemen dan tim karyawan akan mengikuti Leader tersebut.</p>
      </header>

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <EmployeeCreateForm leaders={leaders.map((leader) => ({
          id: leader.id,
          name: leader.name,
          email: leader.email,
          teamName: leader.ledTeam?.name ?? null,
          teamIsActive: leader.ledTeam?.isActive ?? null,
          departmentName: leader.ledTeam?.department.name ?? leader.department?.name ?? null,
          departmentIsActive: leader.ledTeam?.department.isActive ?? leader.department?.isActive ?? false,
        }))} />
      </section>

      <div className="flex justify-end">
        <BackToPreviousButton />
      </div>
    </main>
  );
}
