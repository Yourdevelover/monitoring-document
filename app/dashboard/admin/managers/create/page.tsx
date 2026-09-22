import { requireAdmin } from "@/lib/auth";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";

export default async function CreateManagerPage() {
  await requireAdmin();

  return (
    <main className="space-y-5 p-4 text-slate-900">
      <header className="border-b border-slate-300 pb-4">
        <h1 className="mt-2 text-xl font-semibold">Tambah Manajer</h1>
      </header>
      <form action="/api/admin/managers/create" method="POST" className="grid max-w-2xl gap-3">
        <input name="name" placeholder="Nama manajer" required className="border border-slate-300 px-3 py-2" />
        <input name="email" type="email" placeholder="Email" required className="border border-slate-300 px-3 py-2" />
        <input name="phoneNumber" type="tel" placeholder="Nomor telepon (opsional)" className="border border-slate-300 px-3 py-2" />
        <input name="password" type="password" placeholder="Password" required minLength={6} className="border border-slate-300 px-3 py-2" />
        <button type="submit" className="w-fit bg-slate-900 px-4 py-2 text-sm font-medium text-white">Simpan Manajer</button>
      </form>

      <div className="flex justify-end">
        <BackToPreviousButton />
      </div>
    </main>
  );
}
