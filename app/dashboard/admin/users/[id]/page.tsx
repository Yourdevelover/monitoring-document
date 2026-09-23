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
    <main className="space-y-4 p-2">
      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#6b7280]">Admin Management</p>
            <h1 className="text-base font-bold">Detail Admin</h1>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-[#f8f9fa] p-4">
            <p className="text-sm text-[#6b7280]">Nama</p>
            <p className="mt-1 font-semibold">{user.name}</p>
          </div>
          <div className="rounded-lg bg-[#f8f9fa] p-4">
            <p className="text-sm text-[#6b7280]">Email</p>
            <p className="mt-1 font-semibold">{user.email}</p>
          </div>
          <div className="rounded-lg bg-[#f8f9fa] p-4">
            <p className="text-sm text-[#6b7280]">Role</p>
            <p className="mt-1 font-semibold">{user.role}</p>
          </div>
          <div className="rounded-lg bg-[#f8f9fa] p-4">
            <p className="text-sm text-[#6b7280]">Status</p>
            <p className="mt-1 font-semibold">{user.isActive}</p>
          </div>
          <div className="rounded-lg bg-[#f8f9fa] p-4">
            <p className="text-sm text-[#6b7280]">Dibuat</p>
            <p className="mt-1 font-semibold">{new Date(user.createdAt).toLocaleString("id-ID")}</p>
          </div>
          <div className="rounded-lg bg-[#f8f9fa] p-4">
            <p className="text-sm text-[#6b7280]">Update</p>
            <p className="mt-1 font-semibold">{new Date(user.updatedAt).toLocaleString("id-ID")}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <a
            href={`/dashboard/admin/users/${user.id}/edit`}
            className="rounded-lg bg-[#2563eb] px-4 py-2 font-semibold text-white transition hover:bg-[#1d4ed8]"
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
              className="rounded-lg bg-[#9f2f2d] px-4 py-2 font-semibold text-white transition hover:bg-[#7f1f1f]"
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
