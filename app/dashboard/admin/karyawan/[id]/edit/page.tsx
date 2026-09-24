import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";

type EditEmployeePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  await requireAdmin();
  const { id } = await params;

  const employee = await prisma.user.findFirst({
    where: { id: Number(id), role: "KARYAWAN" },
  });

  if (!employee) notFound();

  return (
    <main className="space-y-4">
      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Kelola Karyawan</p>
            <h1 className="mt-1 text-[13px] font-semibold tracking-tight">Edit Karyawan</h1>
          </div>
        </div>

        <form action="/api/admin/update" method="POST" className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="userId" value={employee.id} />

          <div>
            <label htmlFor="name" className="mb-1 block text-xs font-medium text-[#111111]">
              Nama
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={employee.name}
              required
              className="w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#2563eb] focus:bg-white"
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
              defaultValue={employee.email}
              required
              className="w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#2563eb] focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="mb-1 block text-xs font-medium text-[#111111]">
              Nomor Telepon
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              defaultValue={employee.phoneNumber ?? ""}
              className="w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#2563eb] focus:bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="password" className="mb-1 block text-xs font-medium text-[#111111]">
              Password Baru (opsional)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={6}
              className="w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#2563eb] focus:bg-white"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <Link
              href={`/dashboard/admin/karyawan/${employee.id}`}
              className="btn"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>

        <div className="mt-6 flex justify-end">
          <BackToPreviousButton />
        </div>
      </section>
    </main>
  );
}
