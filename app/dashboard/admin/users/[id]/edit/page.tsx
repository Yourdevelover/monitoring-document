import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export default async function EditAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
  });

  if (!user) {
    notFound();
  }

  return (
    <main className="space-y-6 p-2">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm text-slate-500">Admin Management</p>
          <h1 className="text-2xl font-bold">Edit Admin</h1>
        </div>

        <form action="/api/admin/update" method="POST" className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="userId" value={user.id} />

          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
              Nama
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={user.name}
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
              defaultValue={user.email}
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white"
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
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3">
            <a
              href={`/dashboard/admin/users/${user.id}`}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Batal
            </a>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
