import { requireAdmin } from "@/lib/auth";

export default async function AdminProfilePage() {
  const admin = await requireAdmin();

  return (
    <main className="min-h-screen text-[#111111]">
      <div className="mx-auto max-w-3xl space-y-4">
        <header className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Profil</p>
          <h1 className="mt-1 text-[13px] font-semibold tracking-tight">Profil Admin</h1>
        </header>
        <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
          <div className="grid gap-3 py-1 sm:grid-cols-2">
            <div><p className="text-[11px] text-[#6b7280]">Nama</p><p className="mt-1 text-[13px] font-medium">{admin.name}</p></div>
            <div><p className="text-[11px] text-[#6b7280]">Email</p><p className="mt-1 text-[13px] font-medium">{admin.email}</p></div>
            <div><p className="text-[11px] text-[#6b7280]">Nomor Telepon</p><p className="mt-1 text-[13px] font-medium">{admin.phoneNumber ?? "Belum diisi"}</p></div>
            <div><p className="text-[11px] text-[#6b7280]">Role</p><p className="mt-1 text-[13px] font-medium">{admin.role}</p></div>
          </div>
        </section>
        <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
          <h2 className="mb-3 text-[13px] font-semibold">Ubah Profil</h2>
          <form action="/api/profile" method="POST" className="grid gap-3">
            <input name="name" defaultValue={admin.name} placeholder="Nama" required className="rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20" />
            <input name="email" type="email" defaultValue={admin.email} placeholder="Email" required className="rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20" />
            <input name="phoneNumber" type="tel" defaultValue={admin.phoneNumber ?? ""} placeholder="Nomor telepon" className="rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20" />
            <input name="password" type="password" placeholder="Password baru, kosongkan jika tidak berubah" minLength={6} className="rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20" />
            <button type="submit" className="w-fit rounded-md bg-[#111111] px-4 py-2 text-xs font-medium text-white hover:bg-[#1c1c1c]">Simpan Perubahan</button>
          </form>
        </section>
      </div>
    </main>
  );
}
