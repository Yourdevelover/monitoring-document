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
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Monitoring System
            </p>
            <h1 className="mt-2 text-4xl font-bold">Login Monitoring</h1>
          </div>
          <div className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            Developer A
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold">Informasi awal</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>• Database: Data_monitoring</li>
              <li>• Gunakan akun Admin, Manajer, atau Karyawan.</li>
              <li>• Anda akan diarahkan ke dashboard sesuai role akun.</li>
              <li>• Registrasi manajer tersedia melalui halaman pendaftaran.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <form action="/api/login" method="POST" className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue="admin@monitoring.local"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  defaultValue="admin"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Masuk ke Dashboard
              </button>
            </form>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <p>Belum punya akun manajer?</p>
              <a href="/daftar-manajer" className="mt-2 inline-block font-medium text-blue-600">
                Daftar Manajer Baru
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
