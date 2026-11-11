import { requireLeader } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmployeeCreateForm } from "./employee-create-form";
import { BulkEmployeeForm } from "./bulk-employee-form";

export default async function CreateEmployeePage() {
  const leader = await requireLeader();
  const team = await prisma.team.findUnique({
    where: { leaderId: leader.id },
  });

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-3xl rounded-lg border border-[#e5e7eb] bg-white p-4">
        <h1 className="text-base font-semibold">Tambah Karyawan</h1>
        <p className="mt-2 text-[#6b7280]">Isi data karyawan untuk tim {team?.name ?? leader.name}.</p>
        <EmployeeCreateForm />
        <div className="mt-4">
          <BulkEmployeeForm />
        </div>
      </div>
    </main>
  );
}
