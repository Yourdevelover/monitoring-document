import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { GeneratedPasswordInput } from "@/app/components/generated-password-input";

export default async function CreateAdminPage() {
  await requireAdmin();
  const departments = await prisma.department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  return (
    <main className="space-y-4">
      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Manajemen akun</p>
          <h1 className="mt-1 text-[13px] font-semibold tracking-tight">Tambah Admin Baru</h1>
        </div>

        <form action="/api/admin/create" method="POST" className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-xs font-medium text-[#111111]">
              Nama Admin
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-medium text-[#111111]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="departmentId" className="mb-1 block text-xs font-medium text-[#111111]">
              Departemen
            </label>
            <select
              id="departmentId"
              name="departmentId"
              required
              defaultValue=""
              className="w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
            >
              <option value="" disabled>Pilih departemen</option>
              {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="password" className="mb-1 block text-xs font-medium text-[#111111]">
              Password
            </label>
            <GeneratedPasswordInput id="password" className="min-w-0 flex-1 rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20" />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <Link
              href="/dashboard/admin/users"
              className="inline-flex h-[30px] items-center justify-center rounded-md border border-[#e5e7eb] bg-white px-3 text-xs font-medium text-[#111111] transition hover:bg-[#f8f9fa]"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="inline-flex h-[30px] items-center justify-center rounded-md bg-[#111111] px-3 text-xs font-medium text-white transition hover:bg-[#1c1c1c]"
            >
              Simpan Admin
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
