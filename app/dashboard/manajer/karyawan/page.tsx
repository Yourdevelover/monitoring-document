import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/auth";
import { EmployeeProfileCard } from "../employee-profile-card";
import { EmployeeSearch } from "./employee-search";
import { PaginationControls } from "@/app/components/pagination-controls";

export default async function ManagerEmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const manager = await requireManager();
  const { q, page: pageParam } = await searchParams;
  const searchTerm = q?.trim() ?? "";
  const pageSize = 6;
  const requestedPage = Math.max(1, Number(pageParam) || 1);
  const memberWhere = {
    teamId: 0,
    ...(searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" as const } },
            { email: { contains: searchTerm, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const team = await prisma.team.findUnique({
    where: { managerId: manager.id },
  });
  const totalMembers = team
    ? await prisma.user.count({ where: { ...memberWhere, teamId: team.id } })
    : 0;
  const totalPages = Math.max(1, Math.ceil(totalMembers / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const members = team
    ? await prisma.user.findMany({
        where: { ...memberWhere, teamId: team.id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          uploads: { orderBy: { submissionDate: "desc" } },
          activityLogs: {
            where: { action: "LOGIN" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      })
    : [];
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-4 rounded-lg border border-[#e5e7eb] bg-white p-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#6b7280]">
              Kelola
            </p>
            <h1 className="mt-2 text-base font-bold">Karyawan Tim</h1>
          </div>

        </header>

        <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e7eb] pb-3">
            <h2 className="text-sm font-semibold">Daftar Karyawan</h2>
            <div className="flex flex-wrap items-center gap-3">
              <EmployeeSearch initialValue={searchTerm} />
              <Link
                href="/dashboard/manajer/karyawan/tambah"
                className="bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
              >
                Tambah Karyawan
              </Link>
            </div>
          </div>

          <div className="mt-4">
            {members.map((member) => (
              <div key={member.id} className="relative flex cursor-pointer items-center justify-between gap-4 border-t border-[#e5e7eb] px-3 py-3 transition-colors hover:bg-[#f8f9fa] first:border-t-0 last:border-b">
                <div className="flex min-w-0 flex-1 items-center gap-3 pl-12">
                  <EmployeeProfileCard
                    employee={{
                      ...member,
                      latestLoginAt: member.activityLogs[0]?.createdAt ?? null,
                    }}
                    mode="row"
                    files={member.uploads.map((file) => ({
                      id: file.id,
                      fileName: file.fileName,
                      filePath: file.filePath,
                      category: file.category,
                      status: file.status,
                      isSubmitted: file.isSubmitted,
                      submissionDate: file.submissionDate,
                      expiresAt: file.expiresAt,
                    }))}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#111111]">{member.name}</p>
                    <p className="truncate text-sm text-[#6b7280]">{member.email}</p>
                  </div>
                </div>

                <time
                  dateTime={member.createdAt.toISOString()}
                  className="hidden w-24 shrink-0 text-right text-sm text-[#6b7280] sm:block"
                >
                  {new Date(member.createdAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </time>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="hidden text-xs text-[#6b7280] sm:inline">Lihat info</span>
                  <span className="text-xs text-[#6b7280]">→</span>
                  <span className="bg-[#edf3ec] px-2 py-1 text-center text-xs font-medium text-[#346538]">
                    {member.isActive}
                  </span>
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <p className="border-y border-dashed border-[#d1d5db] py-6 text-center text-sm text-[#6b7280]">
                {searchTerm ? `Tidak ada karyawan yang cocok dengan "${searchTerm}".` : "Belum ada karyawan pada tim Anda."}
              </p>
            )}
          </div>
          <PaginationControls
            basePath="/dashboard/manajer/karyawan"
            page={page}
            totalItems={totalMembers}
            query={{ q: searchTerm || undefined }}
          />
        </section>

      </div>
    </main>
  );
}
