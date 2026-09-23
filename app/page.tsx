import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();

  if (user?.role === "ADMIN") {
    redirect("/dashboard/admin");
  }

  if (user?.role === "MANAGER") {
    redirect("/dashboard/manajer");
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-12 text-[#111111]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6b7280]">
              Monitoring System
            </p>
            <h1 className="mt-3 text-base font-bold tracking-tight md:text-base">
              Masuk ke dashboard
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[#6b7280]">
              Kelola berkas tim, pengumuman, dan persetujuan profil dalam satu tempat.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-md border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-medium text-[#6b7280]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#346538]" />
            Developer A
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-lg border border-[#e5e7eb] bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#111111]">Informasi awal</h2>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[#6b7280]">
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#e1f3fe] text-[10px] font-bold text-[#1f6c9f]">1</span>
                Database: Data_monitoring
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#e1f3fe] text-[10px] font-bold text-[#1f6c9f]">2</span>
                Gunakan akun Admin, Manajer, atau Karyawan.
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#e1f3fe] text-[10px] font-bold text-[#1f6c9f]">3</span>
                Anda akan diarahkan ke dashboard sesuai role akun.
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#e1f3fe] text-[10px] font-bold text-[#1f6c9f]">4</span>
                Registrasi manajer tersedia melalui halaman pendaftaran.
              </li>
            </ul>
          </section>

          <section className="rounded-lg border border-[#e5e7eb] bg-white p-5">
            <form action="/api/login" method="POST" className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue="admin@monitoring.local"
                  className="w-full rounded-md border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  defaultValue="admin"
                  className="w-full rounded-md border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-[#111111] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#333333] active:scale-[0.98]"
              >
                Masuk ke Dashboard
              </button>
            </form>

            <div className="mt-6 rounded-md border border-[#e5e7eb] bg-[#f8f9fa] p-4 text-sm text-[#6b7280]">
              <p>Belum punya akun manajer?</p>
              <a href="/daftar-manajer" className="mt-1.5 inline-block font-medium text-[#2563eb] hover:underline">
                Daftar Manajer Baru
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
