import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ConfirmActionForm } from "@/app/components/confirm-action-form";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <main className="space-y-6 p-2">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Admin Management</p>
            <h1 className="text-2xl font-bold">Detail Admin</h1>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Nama</p>
            <p className="mt-1 font-semibold">{user.name}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Email</p>
            <p className="mt-1 font-semibold">{user.email}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Role</p>
            <p className="mt-1 font-semibold">{user.role}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Status</p>
            <p className="mt-1 font-semibold">{user.isActive}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Dibuat</p>
            <p className="mt-1 font-semibold">{new Date(user.createdAt).toLocaleString("id-ID")}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Update</p>
            <p className="mt-1 font-semibold">{new Date(user.updatedAt).toLocaleString("id-ID")}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <a
            href={`/dashboard/admin/users/${user.id}/edit`}
            className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
          >
            Edit Admin
          </a>
          <ConfirmActionForm
            action="/api/admin/delete"
            confirmMessage="Apakah Anda yakin ingin menghapus admin ini?"
          >
            <input type="hidden" name="userId" value={user.id} />
            <button
              type="submit"
              className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
            >
              Hapus Admin
            </button>
          </ConfirmActionForm>
        </div>

        <div className="mt-6 flex justify-end">
          <BackToPreviousButton />
        </div>
      </section>
    </main>
  );
}
