import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ConfirmActionForm } from "@/app/components/confirm-action-form";
import { PaginationControls } from "@/app/components/pagination-controls";
import { AdminUsersToolbar } from "./admin-users-toolbar";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const pageSize = 6;
  const requestedPage = Math.max(1, Number(params.page) || 1);
  const searchQuery = params.q?.trim() || null;
  const statusFilter = params.status || null;
  const where: Record<string, unknown> = { role: "ADMIN" };
  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { email: { contains: searchQuery, mode: "insensitive" } },
    ];
  }
  if (statusFilter) where.isActive = statusFilter;
  const totalUsers = await prisma.user.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));
  const page = Math.min(requestedPage, totalPages);

  const users = await prisma.user.findMany({
    where,
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
    <main className="space-y-4">
      <header className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Manajemen akun</p>
        <h1 className="mt-1 text-[13px] font-semibold tracking-tight">Kelola Admin</h1>
        <p className="mt-1 text-xs text-[#6b7280]">Daftar admin aktif sistem.</p>
      </header>

      <AdminUsersToolbar searchQuery={searchQuery} statusFilter={statusFilter} />

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <p className="mb-2 text-[11px] text-[#6b7280]">{totalUsers} admin terdaftar</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e5e7eb] text-[10px] uppercase tracking-wide text-[#6b7280]">
                <th className="whitespace-nowrap py-2 pr-4 font-semibold">Nama</th>
                <th className="whitespace-nowrap py-2 pr-4 font-semibold">Email</th>
                <th className="whitespace-nowrap py-2 pr-4 font-semibold">Telepon</th>
                <th className="whitespace-nowrap py-2 pr-4 font-semibold">Status</th>
                <th className="whitespace-nowrap py-2 pr-4 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[#e5e7eb]">
                  <td className="whitespace-nowrap py-2.5 pr-4 font-medium text-[13px]">{user.name}</td>
                  <td className="max-w-[240px] truncate py-2.5 pr-4 text-[13px] text-[#6b7280]">{user.email}</td>
                  <td className="whitespace-nowrap py-2.5 pr-4 text-[13px]">{user.phoneNumber ?? "-"}</td>
                  <td className="whitespace-nowrap py-2.5 pr-4"><span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${user.isActive === 'ACTIVE' ? 'bg-[#edf3ec] text-[#346538]' : 'bg-[#fdebec] text-[#9f2f2d]'}`}>{user.isActive}</span></td>
                  <td className="whitespace-nowrap py-2.5 pr-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <a
                        href={`/dashboard/admin/users/${user.id}`}
                        className="inline-flex h-[30px] items-center rounded-md border border-[#e5e7eb] bg-white px-3 text-xs font-medium text-[#111111] transition hover:bg-[#f8f9fa]"
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
                          className="inline-flex h-[30px] items-center rounded-md bg-[#fdebec] px-3 text-xs font-medium text-[#9f2f2d] hover:bg-[#fbd5d7]"
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
