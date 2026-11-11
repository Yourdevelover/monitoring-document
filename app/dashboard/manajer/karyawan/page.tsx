import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireManajer } from "@/lib/auth";
import { EmployeeSearch } from "./employee-search";
import { PaginationControls } from "@/app/components/pagination-controls";

export default async function ManagerEmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireManajer();
  const { q, page: pageParam } = await searchParams;
  const searchTerm = q?.trim() ?? "";
  const pageSize = 12;
  const requestedPage = Math.max(1, Number(pageParam) || 1);
  const where = {
    role: "KARYAWAN" as const,
    ...(searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" as const } },
            { email: { contains: searchTerm, mode: "insensitive" as const } },
            { position: { contains: searchTerm, mode: "insensitive" as const } },
            { department: { name: { contains: searchTerm, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };
  const totalItems = await prisma.user.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const employees = await prisma.user.findMany({
    where,
    include: { department: true, team: { include: { department: true } } },
    orderBy: { name: "asc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="border-b border-[#e5e7eb] pb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
            Seluruh Departemen
          </p>
          <h1 className="mt-1 text-[15px] font-semibold">Data Karyawan</h1>
        </header>
        <section className="bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e7eb] p-3">
            <p className="text-xs text-[#6b7280]">{totalItems} karyawan</p>
            <EmployeeSearch initialValue={searchTerm} />
          </div>
          <div className="divide-y divide-[#e5e7eb]">
            {employees.map((employee) => (
              <Link
                key={employee.id}
                href={`/dashboard/manajer/karyawan/${employee.id}`}
                className="grid gap-1 px-3 py-3 hover:bg-[#f8f9fa] sm:grid-cols-[1.2fr_1.2fr_1fr_1fr_auto] sm:items-center"
              >
                <span className="min-w-0">
                  <strong className="block truncate text-xs">
                    {employee.name}
                  </strong>
                  <small className="block truncate text-[#6b7280]">
                    {employee.email}
                  </small>
                </span>
                <span className="truncate text-xs">
                  {employee.department?.name ??
                    employee.team?.department.name ?? "-"}
                </span>
                <span className="truncate text-xs text-[#6b7280]">
                  {employee.position ?? "-"}
                </span>
                <span className="text-xs text-[#6b7280]">
                  {employee.team?.name ?? "Tanpa tim"}
                </span>
                <span className="text-[11px] text-[#6b7280]">
                  {employee.isActive}
                </span>
              </Link>
            ))}
            {employees.length === 0 && (
              <p className="px-4 py-8 text-center text-xs text-[#6b7280]">
                Tidak ada karyawan yang cocok.
              </p>
            )}
          </div>
          <PaginationControls
            basePath="/dashboard/manajer/karyawan"
            page={page}
            totalItems={totalItems}
            query={{ q: searchTerm || undefined }}
          />
        </section>
      </div>
    </main>
  );
}
