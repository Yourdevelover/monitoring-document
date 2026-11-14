import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ConfirmActionForm } from "@/app/components/confirm-action-form";

const roles = [
  { key: "leaders", label: "Leader", role: "LEADER" },
  { key: "karyawan", label: "Karyawan", role: "KARYAWAN" },
  { key: "managers", label: "Manajer", role: "MANAJER" },
] as const;

type ApprovalRole = (typeof roles)[number]["key"];

export default async function AdminApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; result?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const activeRole: ApprovalRole = roles.some((item) => item.key === query.role)
    ? query.role as ApprovalRole
    : "leaders";
  const selectedRole = roles.find((item) => item.key === activeRole)!;

  const [pendingUsers, rejectedUsers, pendingCounts] = await Promise.all([
    prisma.user.findMany({
      where: { role: selectedRole.role, isActive: "PENDING" },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
        department: { select: { name: true } },
        ledTeam: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findMany({
      where: { role: selectedRole.role, isActive: "REJECTED" },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
        department: { select: { name: true } },
        ledTeam: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    Promise.all(roles.map((item) =>
      prisma.user.count({ where: { role: item.role, isActive: "PENDING" } })
    )),
  ]);

  const pendingCountByRole = new Map(roles.map((item, index) => [item.key, pendingCounts[index]]));

  return (
    <main className="space-y-4">
      <header className="flex flex-col gap-3 rounded-lg border border-[#e5e7eb] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Manajemen akun</p>
          <h1 className="mt-1 text-[15px] font-semibold">Persetujuan Pendaftaran</h1>
          <p className="mt-1 text-xs text-[#6b7280]">Setujui atau tolak pendaftaran akun. Pendaftaran yang ditolak dapat disetujui kembali dari histori.</p>
        </div>
        <Link href="/dashboard/admin/karyawan" className="text-xs font-medium text-[#1f6c9f] hover:underline">
          Kembali ke Kelola Pengguna
        </Link>
      </header>

      <nav aria-label="Jenis akun untuk persetujuan" className="flex overflow-x-auto border-b border-[#e5e7eb]">
        {roles.map((item) => (
          <Link
            key={item.key}
            href={`/dashboard/admin/approvals?role=${item.key}`}
            aria-current={activeRole === item.key ? "page" : undefined}
            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-medium ${
              activeRole === item.key
                ? "border-[#111111] text-[#111111]"
                : "border-transparent text-[#6b7280] hover:text-[#111111]"
            }`}
          >
            {item.label}
            <span className="rounded bg-[#f1f3f5] px-1.5 py-0.5 tabular-nums">{pendingCountByRole.get(item.key)}</span>
          </Link>
        ))}
      </nav>

      {query.result === "approved" && <p role="status" className="rounded-md bg-[#edf3ec] px-3 py-2 text-xs font-medium text-[#346538]">Pendaftaran berhasil disetujui.</p>}
      {query.result === "rejected" && <p role="status" className="rounded-md bg-[#fef2f2] px-3 py-2 text-xs font-medium text-[#991b1b]">Pendaftaran ditolak dan dipindahkan ke histori.</p>}

      <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide">Pendaftaran {selectedRole.label}</h2>
            <p className="mt-1 text-[11px] text-[#6b7280]">{pendingUsers.length} menunggu persetujuan</p>
          </div>
        </div>
        {pendingUsers.length ? (
          <div className="divide-y divide-[#f1f3f5]">
            {pendingUsers.map((user) => (
              <article key={user.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{user.name}</p>
                  <p className="truncate text-xs text-[#6b7280]">{user.email}</p>
                  <p className="mt-1 text-[11px] text-[#6b7280]">
                    {user.phoneNumber || "Telepon tidak diisi"}
                    {user.department?.name ? ` · ${user.department.name}` : ""}
                    {user.ledTeam?.name ? ` · ${user.ledTeam.name}` : ""}
                    {` · Daftar ${new Date(user.createdAt).toLocaleDateString("id-ID")}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action="/api/admin/users/approval" method="POST">
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="role" value={selectedRole.role} />
                    <input type="hidden" name="decision" value="reject" />
                    <button type="submit" className="h-8 rounded-md border border-[#e5e7eb] px-3 text-xs font-medium text-[#9f2f2d] hover:bg-[#fff5f5]">Non-ACC</button>
                  </form>
                  <form action="/api/admin/users/approval" method="POST">
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="role" value={selectedRole.role} />
                    <input type="hidden" name="decision" value="approve" />
                    <button type="submit" className="h-8 rounded-md bg-[#346538] px-3 text-xs font-medium text-white hover:bg-[#2d5a30]">ACC</button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="px-4 py-8 text-center text-xs text-[#6b7280]">Tidak ada pendaftaran {selectedRole.label.toLowerCase()} yang menunggu.</p>
        )}
      </section>

      <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
        <div className="border-b border-[#e5e7eb] px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Histori pendaftaran ditolak</h2>
          <p className="mt-1 text-[11px] text-[#6b7280]">{rejectedUsers.length} akun ditolak. Akun dapat disetujui kembali di sini.</p>
        </div>
        {rejectedUsers.length ? (
          <div className="divide-y divide-[#f1f3f5]">
            {rejectedUsers.map((user) => (
              <article key={user.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{user.name}</p>
                  <p className="truncate text-xs text-[#6b7280]">{user.email}</p>
                  <p className="mt-1 text-[11px] text-[#9f2f2d]">Ditolak · Daftar {new Date(user.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action="/api/admin/users/approval" method="POST">
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="role" value={selectedRole.role} />
                    <input type="hidden" name="decision" value="approve" />
                    <button type="submit" className="h-8 rounded-md bg-[#346538] px-3 text-xs font-medium text-white hover:bg-[#2d5a30]">ACC kembali</button>
                  </form>
                  {selectedRole.role === "LEADER" ? (
                    <ConfirmActionForm
                      action="/api/admin/leaders/action"
                      confirmMessage={`Hapus permanen akun leader ${user.name}? Akun tidak dapat dipulihkan.`}
                    >
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="action" value="delete" />
                      <button type="submit" className="h-8 rounded-md border border-red-200 px-3 text-xs font-medium text-red-700 hover:bg-red-50">Hapus</button>
                    </ConfirmActionForm>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="px-4 py-6 text-center text-xs text-[#6b7280]">Belum ada pendaftaran yang ditolak.</p>
        )}
      </section>

    </main>
  );
}