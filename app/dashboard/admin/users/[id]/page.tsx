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
    <main className="space-y-4">
      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Detail</p>
            <h1 className="mt-1 text-[13px] font-semibold tracking-tight">Detail Admin</h1>
          </div>
        </div>

        <div className="grid gap-3 rounded-lg border border-[#e5e7eb] bg-[#f8f9fa] p-4 md:grid-cols-2">
          <div><p className="text-[11px] text-[#6b7280]">Nama</p><p className="mt-1 text-[13px] font-medium">{user.name}</p></div>
          <div><p className="text-[11px] text-[#6b7280]">Email</p><p className="mt-1 text-[13px] font-medium">{user.email}</p></div>
          <div><p className="text-[11px] text-[#6b7280]">Role</p><p className="mt-1 text-[13px] font-medium">{user.role}</p></div>
          <div><p className="text-[11px] text-[#6b7280]">Status</p><p className="mt-1 text-[13px] font-medium">{user.isActive}</p></div>
          <div><p className="text-[11px] text-[#6b7280]">Dibuat</p><p className="mt-1 text-[13px] font-medium">{new Date(user.createdAt).toLocaleString("id-ID")}</p></div>
          <div><p className="text-[11px] text-[#6b7280]">Update</p><p className="mt-1 text-[13px] font-medium">{new Date(user.updatedAt).toLocaleString("id-ID")}</p></div>
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <a
            href={`/dashboard/admin/users/${user.id}/edit`}
            className="inline-flex h-[30px] items-center justify-center rounded-md border border-[#e5e7eb] bg-white px-3 text-xs font-medium text-[#111111] hover:bg-[#f8f9fa]"
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
              className="inline-flex h-[30px] items-center justify-center rounded-md bg-[#fdebec] px-3 text-xs font-medium text-[#9f2f2d] hover:bg-[#fbd5d7]"
            >
              Hapus Admin
            </button>
          </ConfirmActionForm>
        </div>

        <div className="mt-4 flex justify-end">
          <BackToPreviousButton />
        </div>
      </section>
    </main>
  );
}
