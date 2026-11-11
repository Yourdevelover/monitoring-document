import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";
import { GeneratedPasswordInput } from "@/app/components/generated-password-input";

export default async function CreateLeaderPage() {
  await requireAdmin();
  const departments = await prisma.department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  return (
    <main className="space-y-4">
      <header className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Manajemen akun</p>
        <h1 className="mt-1 text-[13px] font-semibold tracking-tight">Tambah Leader</h1>
        <p className="mt-1 text-xs text-[#6b7280]">Buat akun leader baru.</p>
      </header>
      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
      <form action="/api/admin/leaders/create" method="POST" className="grid max-w-2xl gap-3">
        <input name="name" placeholder="Nama leader" required className="border border-[#e5e7eb] px-3 py-2" />
        <input name="email" type="email" placeholder="Email" required className="border border-[#e5e7eb] px-3 py-2" />
        <input name="phoneNumber" type="tel" placeholder="Nomor telepon (opsional)" className="border border-[#e5e7eb] px-3 py-2" />
        <label className="grid gap-1 text-xs font-medium text-[#111111]">
          Password
          <GeneratedPasswordInput className="min-w-0 flex-1 rounded-md border border-[#e5e7eb] px-3 py-2 text-sm" />
        </label>
        <label className="grid gap-1 text-xs font-medium text-[#111111]">
          Departemen
          <select name="departmentId" required defaultValue="" className="border border-[#e5e7eb] px-3 py-2 font-normal text-sm">
            <option value="" disabled>Pilih departemen</option>
            {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
          </select>
        </label>
        <button type="submit" className="btn btn-primary w-fit">Simpan Leader</button>
      </form>
      </section>

      <div className="flex justify-end">
        <BackToPreviousButton />
      </div>
    </main>
  );
}
