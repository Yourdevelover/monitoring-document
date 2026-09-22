import { requireAdmin } from "@/lib/auth";

export default async function AdminProfilePage() {
  const admin = await requireAdmin();

  return (
    <main className="min-h-screen text-slate-900">
      <div className="mx-auto max-w-3xl space-y-5">
        <header className="border-b border-slate-300 pb-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Profil</p>
          <h1 className="mt-1 text-xl font-semibold">Profil Admin</h1>
        </header>
        <section>
          <div className="grid gap-3 border-y border-slate-200 py-3 sm:grid-cols-2">
            <p><span className="text-xs text-slate-500">Nama</span><br /><strong>{admin.name}</strong></p>
            <p><span className="text-xs text-slate-500">Email</span><br /><strong>{admin.email}</strong></p>
            <p><span className="text-xs text-slate-500">Nomor Telepon</span><br /><strong>{admin.phoneNumber ?? "Belum diisi"}</strong></p>
            <p><span className="text-xs text-slate-500">Role</span><br /><strong>{admin.role}</strong></p>
          </div>
        </section>
        <section className="border-t border-slate-300 pt-4">
          <h2 className="text-base font-semibold">Ubah Profil</h2>
          <form action="/api/profile" method="POST" className="mt-3 grid gap-3">
            <input name="name" defaultValue={admin.name} placeholder="Nama" required className="border border-slate-300 px-3 py-2" />
            <input name="email" type="email" defaultValue={admin.email} placeholder="Email" required className="border border-slate-300 px-3 py-2" />
            <input name="phoneNumber" type="tel" defaultValue={admin.phoneNumber ?? ""} placeholder="Nomor telepon" className="border border-slate-300 px-3 py-2" />
            <input name="password" type="password" placeholder="Password baru, kosongkan jika tidak berubah" minLength={6} className="border border-slate-300 px-3 py-2" />
            <button type="submit" className="w-fit bg-slate-900 px-4 py-2 text-sm font-medium text-white">Simpan Perubahan</button>
          </form>
        </section>
      </div>
    </main>
  );
}
