import { requireAdmin } from "@/lib/auth";
import Link from "next/link";

export default async function CreateAdminPage() {
  await requireAdmin();

  return (
    <main className="space-y-6 p-2">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm text-slate-500">Admin Management</p>
          <h1 className="text-2xl font-bold">Tambah Admin Baru</h1>
        </div>

        <form action="/api/admin/create" method="POST" className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
              Nama Admin
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3">
            <Link
              href="/dashboard/admin/users"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
            >
              Simpan Admin
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
