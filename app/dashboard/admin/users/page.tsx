import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ConfirmActionForm } from "@/app/components/confirm-action-form";
import { PaginationControls } from "@/app/components/pagination-controls";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const pageSize = 6;
  const requestedPage = Math.max(1, Number(params.page) || 1);
  const totalUsers = await prisma.user.count({ where: { role: "ADMIN" } });
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));
  const page = Math.min(requestedPage, totalPages);

  const users = await prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      phoneNumber: true,
      createdAt: true,
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return (
    <main className="space-y-4 p-2">
      <header className="rounded-lg border border-[#e5e7eb] bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[#6b7280]">Admin Management</p>
            <h1 className="text-base font-bold">Kelola Admin</h1>
          </div>
          <Link
            href="/dashboard/admin/users/create"
            className="rounded-lg bg-[#2563eb] px-4 py-2 font-semibold text-white transition hover:bg-[#1d4ed8]"
          >
            + Tambah Admin
          </Link>
        </div>
      </header>

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb] text-[#6b7280]">
                <th className="py-2 pr-4">Nama</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Telepon</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[#e5e7eb]">
                  <td className="py-3 pr-4">{user.name}</td>
                  <td className="py-3 pr-4">{user.email}</td>
                  <td className="py-3 pr-4">{user.phoneNumber ?? "-"}</td>
                  <td className="py-3 pr-4">{user.isActive}</td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-2">
                      <a
                        href={`/dashboard/admin/users/${user.id}`}
                        className="rounded-lg bg-[#f8f9fa] px-3 py-1.5 text-xs font-semibold text-[#111111] hover:bg-[#e5e7eb]"
                      >
                        Detail
                      </a>
                      <ConfirmActionForm
                        action="/api/admin/delete"
                        confirmMessage="Apakah Anda yakin ingin menghapus admin ini?"
                      >
                        <input type="hidden" name="userId" value={user.id} />
                        <button
                          type="submit"
                          className="rounded-lg bg-[#fdebec] px-3 py-1.5 text-xs font-semibold text-[#9f2f2d] hover:bg-[#fdebec]"
                        >
                          Hapus
                        </button>
                      </ConfirmActionForm>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationControls basePath="/dashboard/admin/users" page={page} totalItems={totalUsers} />
      </section>
    </main>
  );
}
