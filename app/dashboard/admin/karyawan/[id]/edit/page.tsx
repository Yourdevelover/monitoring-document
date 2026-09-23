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
    <main className="space-y-4 p-4 text-slate-900">
      <section className="rounded-lg bg-white p-4">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Kelola Karyawan</p>
            <h1 className="text-base font-bold">Edit Karyawan</h1>
          </div>
        </div>

        <form action="/api/admin/update" method="POST" className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="userId" value={employee.id} />

          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
              Nama
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={employee.name}
              required
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white"
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
              defaultValue={employee.email}
              required
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="mb-1 block text-sm font-medium text-slate-700">
              Nomor Telepon
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              defaultValue={employee.phoneNumber ?? ""}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Password Baru (opsional)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={6}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3">
            <Link
              href={`/dashboard/admin/karyawan/${employee.id}`}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
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
