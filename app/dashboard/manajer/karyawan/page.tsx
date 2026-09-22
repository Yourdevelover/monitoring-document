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
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
              Kelola
            </p>
            <h1 className="mt-2 text-3xl font-bold">Karyawan Tim</h1>
          </div>

        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <h2 className="text-xl font-semibold">Daftar Karyawan</h2>
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
              <div key={member.id} className="relative flex cursor-pointer items-center justify-between gap-4 border-t border-slate-200 px-3 py-3 transition-colors hover:bg-slate-50 first:border-t-0 last:border-b">
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
                    <p className="truncate font-medium text-slate-900">{member.name}</p>
                    <p className="truncate text-sm text-slate-500">{member.email}</p>
                  </div>
                </div>

                <time
                  dateTime={member.createdAt.toISOString()}
                  className="hidden w-24 shrink-0 text-right text-sm text-slate-500 sm:block"
                >
                  {new Date(member.createdAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </time>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="hidden text-xs text-slate-500 sm:inline">Lihat info</span>
                  <span className="text-xs text-slate-500">→</span>
                  <span className="bg-emerald-50 px-2 py-1 text-center text-xs font-medium text-emerald-700">
                    {member.isActive}
                  </span>
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <p className="border-y border-dashed border-slate-300 py-6 text-center text-sm text-slate-600">
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
