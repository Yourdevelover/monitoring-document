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
    <main className="space-y-4 p-4 text-slate-900">
      <header className="border-b border-slate-300 pb-4">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Manajemen akun</p>
        <h1 className="mt-1 text-base font-semibold">Tambah Karyawan</h1>
        <p className="mt-1 text-sm text-slate-500">Pilih tim yang sudah terdaftar untuk menentukan manajer karyawan.</p>
      </header>

      <form action="/api/admin/karyawan/create" method="POST" className="grid max-w-2xl gap-3">
        <input name="name" placeholder="Nama karyawan" required className="border border-slate-300 px-3 py-2" />
        <input name="email" type="email" placeholder="Email" required className="border border-slate-300 px-3 py-2" />
        <input name="phoneNumber" type="tel" placeholder="Nomor telepon" className="border border-slate-300 px-3 py-2" />
        <input name="password" type="password" placeholder="Password" required minLength={6} className="border border-slate-300 px-3 py-2" />
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Tim dan Manajer
          <select name="teamId" required defaultValue="" className="border border-slate-300 px-3 py-2 font-normal text-slate-900">
            <option value="" disabled>Pilih tim</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} - Manajer: {team.manager.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="w-fit bg-slate-900 px-4 py-2 text-sm font-medium text-white">Simpan Karyawan</button>
      </form>

      <div className="flex justify-end">
        <BackToPreviousButton />
      </div>
    </main>
  );
}
