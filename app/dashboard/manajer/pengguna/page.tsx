import Link from "next/link";
import { Prisma } from "@prisma/client";
import { PaginationControls } from "@/app/components/pagination-controls";
import { requireManajer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const directoryTabs = [
  { key: "ALL", label: "Semua" },
  { key: "LEADER", label: "Leader" },
  { key: "KARYAWAN", label: "Karyawan" },
  { key: "TEAM", label: "Tim" },
] as const;

const roleLabels = {
  ADMIN: "Admin",
  LEADER: "Leader",
  MANAJER: "Manajer",
  KARYAWAN: "Karyawan",
} as const;

export default async function ManagerUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string; page?: string }>;
}) {
  await requireManajer();
  const params = await searchParams;
  const requestedTab = params.role === "TEAM_TARGETS" ? "TEAM" : params.role;
  const selectedTab = directoryTabs.find((tab) => tab.key === requestedTab)?.key ?? "ALL";
  const search = params.q?.trim() ?? "";
  const pageSize = 20;
  const requestedPage = Math.max(1, Number(params.page) || 1);
  const period = new Date().toISOString().slice(0, 7);
  const isTeamTab = selectedTab === "TEAM";
  const userRoles = selectedTab === "ALL" ? ["LEADER", "KARYAWAN"] as const : isTeamTab ? [] : [selectedTab];
  const userWhere: Prisma.UserWhereInput = {
    role: { in: [...userRoles] },
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phoneNumber: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const teamWhere: Prisma.TeamWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { leader: { name: { contains: search, mode: "insensitive" } } },
          { department: { name: { contains: search, mode: "insensitive" } } },
        ],
      }
    : {};

  const [leaderCount, employeeCount, teamCount, selectedCount] = await Promise.all([
    prisma.user.count({ where: { role: "LEADER" } }),
    prisma.user.count({ where: { role: "KARYAWAN" } }),
    prisma.team.count(),
    isTeamTab ? prisma.team.count({ where: teamWhere }) : prisma.user.count({ where: userWhere }),
  ]);
  const counts = { ALL: leaderCount + employeeCount, LEADER: leaderCount, KARYAWAN: employeeCount, TEAM: teamCount };
  const totalPages = Math.max(1, Math.ceil(selectedCount / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const [users, teams] = await Promise.all([
    isTeamTab
      ? Promise.resolve([])
      : prisma.user.findMany({
          where: userWhere,
          orderBy: [{ role: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            position: true,
            department: { select: { name: true } },
            team: { select: { id: true, name: true, department: { select: { name: true } } } },
            ledTeam: { select: { id: true, name: true, department: { select: { name: true } } } },
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
    isTeamTab
      ? prisma.team.findMany({
          where: teamWhere,
          orderBy: [{ department: { name: "asc" } }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            isActive: true,
            department: { select: { name: true } },
            leader: {
              select: {
                name: true,
                email: true,
                targets: { where: { period }, select: { targetValue: true, currentValue: true } },
              },
            },
            members: {
              select: {
                targets: { where: { period }, select: { targetValue: true, currentValue: true } },
              },
            },
            _count: { select: { members: true, uploads: true } },
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
        })
      : Promise.resolve([]),
  ]);

  const query = { role: selectedTab === "ALL" ? undefined : selectedTab, q: search || undefined };

  return (
    <main className="space-y-4">
      <header className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Seluruh departemen · Akses baca</p>
        <h1 className="mt-1 text-[15px] font-semibold">Data &amp; Kinerja</h1>
        <p className="mt-1 text-xs text-[#6b7280]">Data pengguna, tim, dan ringkasan target per tim. Akses hanya untuk melihat.</p>
      </header>

      <nav aria-label="Filter pengguna dan tim" className="flex overflow-x-auto border-b border-[#e5e7eb]">
        {directoryTabs.map((tab) => {
          const count = counts[tab.key];
          const href = tab.key === "ALL"
            ? "/dashboard/manajer/pengguna"
            : `/dashboard/manajer/pengguna?role=${tab.key}`;

          return (
            <Link
              key={tab.key}
              href={href}
              aria-current={selectedTab === tab.key ? "page" : undefined}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-medium ${
                selectedTab === tab.key
                  ? "border-[#111111] text-[#111111]"
                  : "border-transparent text-[#6b7280] hover:text-[#111111]"
              }`}
            >
              {tab.label}
              <span className="rounded bg-[#f1f3f5] px-1.5 py-0.5 tabular-nums">{count}</span>
            </Link>
          );
        })}
      </nav>

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        <form method="GET" className="mb-3 flex flex-wrap items-end gap-2">
          {selectedTab !== "ALL" && <input type="hidden" name="role" value={selectedTab} />}
          <label className="min-w-[220px] flex-1 text-xs font-medium text-[#374151]">
            {selectedTab === "TEAM" ? "Cari tim" : "Cari pengguna"}
            <input
              name="q"
              type="search"
              defaultValue={search}
              placeholder={isTeamTab ? "Nama tim, leader, departemen" : "Nama, email, atau telepon"}
              className="mt-1 block h-9 w-full rounded-md border border-[#d1d5db] bg-white px-3 text-xs outline-none focus:border-[#2563eb]"
            />
          </label>
          <button type="submit" className="h-9 rounded-md border border-[#d1d5db] px-3 text-xs font-medium hover:bg-[#f8f9fa]">Cari</button>
        </form>

        <p className="mb-2 text-[11px] text-[#6b7280]">{selectedCount} {isTeamTab ? "tim" : "pengguna"} ditemukan</p>
        {selectedTab === "TEAM" ? (
          <div className="overflow-x-auto">
            <div className="min-w-[1100px] text-left text-xs">
              <div className="grid grid-cols-[minmax(160px,1.3fr)_minmax(130px,1fr)_minmax(150px,1.2fr)_minmax(72px,0.55fr)_minmax(72px,0.55fr)_minmax(72px,0.55fr)_minmax(175px,1.35fr)_minmax(110px,0.8fr)_minmax(90px,0.7fr)] border-b border-[#e5e7eb] text-[10px] uppercase tracking-wide text-[#6b7280]">
                <span className="px-3 py-2.5 font-semibold">Tim</span><span className="px-3 py-2.5 font-semibold">Leader</span><span className="px-3 py-2.5 font-semibold">Departemen</span><span className="px-3 py-2.5 text-right font-semibold">Anggota</span><span className="px-3 py-2.5 text-right font-semibold">Berkas</span><span className="px-3 py-2.5 text-right font-semibold">Target</span><span className="px-3 py-2.5 text-right font-semibold">Progres</span><span className="px-3 py-2.5 text-right font-semibold">Pencapaian</span><span className="px-3 py-2.5 text-right font-semibold">Status</span>
              </div>
              {teams.map((team) => {
                const teamTargets = [...team.leader.targets, ...team.members.flatMap((member) => member.targets)];
                const targetValue = teamTargets.reduce((sum, target) => sum + target.targetValue, 0);
                const currentValue = teamTargets.reduce((sum, target) => sum + target.currentValue, 0);
                const progress = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;
                return (
                  <Link key={team.id} href={`/dashboard/manajer/tim/${team.id}`} className="grid grid-cols-[minmax(160px,1.3fr)_minmax(130px,1fr)_minmax(150px,1.2fr)_minmax(72px,0.55fr)_minmax(72px,0.55fr)_minmax(72px,0.55fr)_minmax(175px,1.35fr)_minmax(110px,0.8fr)_minmax(90px,0.7fr)] items-center border-b border-[#f1f3f5] text-[#111111] hover:bg-[#f8f9fa] focus-visible:outline-2 focus-visible:outline-[#2563eb] last:border-0">
                    <span className="px-3 py-3 font-medium">{team.name}</span>
                    <span className="px-3 py-3">{team.leader.name}</span>
                    <span className="px-3 py-3">{team.department.name}</span>
                    <span className="px-3 py-3 text-right tabular-nums">{team._count.members}</span>
                    <span className="px-3 py-3 text-right tabular-nums">{team._count.uploads}</span>
                    <span className="px-3 py-3 text-right tabular-nums">{teamTargets.length}</span>
                    <span className="px-3 py-3 text-right tabular-nums text-[#6b7280]">{currentValue.toLocaleString("id-ID")} / {targetValue.toLocaleString("id-ID")}</span>
                    <span className="px-3 py-3 text-right font-semibold tabular-nums">{targetValue > 0 ? `${progress.toFixed(1)}%` : "-"}</span>
                    <span className={`px-3 py-3 text-right font-medium ${team.isActive ? "text-[#346538]" : "text-[#6b7280]"}`}>{team.isActive ? "Aktif" : "Nonaktif"}</span>
                  </Link>
                );
              })}
              {teams.length === 0 && <p className="px-3 py-8 text-center text-xs text-[#6b7280]">Tidak ada tim yang cocok.</p>}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[760px] text-left text-xs">
              <div className="grid grid-cols-[1.3fr_0.7fr_1fr_1fr_auto] border-b border-[#e5e7eb] text-[10px] uppercase tracking-wide text-[#6b7280]">
                <span className="px-3 py-2 font-semibold">Nama / Email</span><span className="px-3 py-2 font-semibold">Role</span><span className="px-3 py-2 font-semibold">Departemen</span><span className="px-3 py-2 font-semibold">Tim / Jabatan</span><span className="px-3 py-2 font-semibold">Status</span>
              </div>
              {users.map((user) => (
                <Link key={user.id} href={user.role === "LEADER" ? `/dashboard/manajer/leader/${user.id}` : `/dashboard/manajer/karyawan/${user.id}`} className="grid grid-cols-[1.3fr_0.7fr_1fr_1fr_auto] items-center border-b border-[#f1f3f5] text-[#111111] hover:bg-[#f8f9fa] focus-visible:outline-2 focus-visible:outline-[#2563eb] last:border-0">
                  <span className="min-w-[190px] px-3 py-2.5"><span className="block font-medium">{user.name}</span><span className="mt-0.5 block text-[11px] text-[#6b7280]">{user.email}</span></span>
                  <span className="px-3 py-2.5">{roleLabels[user.role]}</span>
                  <span className="px-3 py-2.5">{user.department?.name ?? user.team?.department.name ?? user.ledTeam?.department.name ?? "-"}</span>
                  <span className="px-3 py-2.5">{user.team?.name ?? user.ledTeam?.name ?? user.position ?? "-"}</span>
                  <span className="px-3 py-2.5"><span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-medium ${user.isActive === "ACTIVE" ? "bg-[#edf3ec] text-[#346538]" : user.isActive === "PENDING" ? "bg-[#fff4dd] text-[#8a5a00]" : "bg-[#f3f4f6] text-[#4b5563]"}`}>{user.isActive}</span></span>
                </Link>
              ))}
              {users.length === 0 && <p className="px-3 py-8 text-center text-xs text-[#6b7280]">Tidak ada pengguna yang cocok.</p>}
            </div>
          </div>
        )}
        <PaginationControls basePath="/dashboard/manajer/pengguna" page={page} totalItems={selectedCount} pageSize={pageSize} query={query} />
      </section>
    </main>
  );
}