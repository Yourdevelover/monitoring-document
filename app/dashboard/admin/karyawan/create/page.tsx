import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";

export default async function CreateEmployeePage() {
  await requireAdmin();

  const teams = await prisma.team.findMany({
    include: { manager: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="space-y-4">
      <header className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Manajemen akun</p>
        <h1 className="mt-1 text-[13px] font-semibold tracking-tight">Tambah Karyawan</h1>
        <p className="mt-1 text-xs text-[#6b7280]">Pilih tim yang sudah terdaftar untuk menentukan manajer karyawan.</p>
      </header>

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
      <form action="/api/admin/karyawan/create" method="POST" className="grid max-w-2xl gap-3">
        <input name="name" placeholder="Nama karyawan" required className="border border-[#e5e7eb] px-3 py-2 text-sm" />
        <input name="email" type="email" placeholder="Email" required className="border border-[#e5e7eb] px-3 py-2 text-sm" />
        <input name="phoneNumber" type="tel" placeholder="Nomor telepon" className="border border-[#e5e7eb] px-3 py-2 text-sm" />
        <input name="password" type="password" placeholder="Password" required minLength={6} className="border border-[#e5e7eb] px-3 py-2 text-sm" />
        <label className="grid gap-1 text-xs font-medium text-[#111111]">
          Tim dan Manajer
          <select name="teamId" required defaultValue="" className="border border-[#e5e7eb] px-3 py-2 font-normal text-[#111111] text-sm">
            <option value="" disabled>Pilih tim</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} - Manajer: {team.manager.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-primary w-fit">Simpan Karyawan</button>
      </form>
      </section>

      <div className="flex justify-end">
        <BackToPreviousButton />
      </div>
    </main>
  );
}
