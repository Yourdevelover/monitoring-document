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
    <main className="space-y-4">
      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Admin Management</p>
          <h1 className="text-[13px] font-semibold tracking-tight">Edit Admin</h1>
        </div>

        <form action="/api/admin/update" method="POST" className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="userId" value={user.id} />

          <div>
            <label htmlFor="name" className="mb-1 block text-xs font-medium text-[#111111]">
              Nama
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={user.name}
              required
              className="w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2 outline-none transition focus:border-[#2563eb] focus:bg-white"
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
              defaultValue={user.email}
              required
              className="w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2 outline-none transition focus:border-[#2563eb] focus:bg-white"
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
              className="w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2 outline-none transition focus:border-[#2563eb] focus:bg-white"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <a
              href={`/dashboard/admin/users/${user.id}`}
              className="btn"
            >
              Batal
            </a>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
