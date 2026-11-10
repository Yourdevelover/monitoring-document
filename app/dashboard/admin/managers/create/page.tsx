import { requireAdmin } from "@/lib/auth";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";

export default async function CreateLeaderPage() {
  await requireAdmin();

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
        <input name="password" type="password" placeholder="Password" required minLength={6} className="border border-[#e5e7eb] px-3 py-2" />
        <button type="submit" className="btn btn-primary w-fit">Simpan Leader</button>
      </form>
      </section>

      <div className="flex justify-end">
        <BackToPreviousButton />
      </div>
    </main>
  );
}
