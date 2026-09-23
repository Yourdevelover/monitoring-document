import { requireAdmin } from "@/lib/auth";
import Link from "next/link";

export default async function CreateAdminPage() {
  await requireAdmin();

  return (
    <main className="space-y-4 p-2">
      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="mb-6">
          <p className="text-sm text-[#6b7280]">Admin Management</p>
          <h1 className="text-base font-bold">Tambah Admin Baru</h1>
        </div>

        <form action="/api/admin/create" method="POST" className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-[#111111]">
              Nama Admin
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-lg border border-[#e5e7eb] bg-[#f8f9fa] px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#111111]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-[#e5e7eb] bg-[#f8f9fa] px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-[#111111]">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full rounded-lg border border-[#e5e7eb] bg-[#f8f9fa] px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3">
            <Link
              href="/dashboard/admin/users"
              className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 font-medium text-[#111111] transition hover:bg-[#f8f9fa]"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-[#2563eb] px-4 py-2 font-semibold text-white transition hover:bg-[#1d4ed8]"
            >
              Simpan Admin
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
