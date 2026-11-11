import Link from "next/link";
import { prisma } from "@/lib/prisma";

const tabs = [
  { role: "admin", label: "Admin", href: "/dashboard/admin/users" },
  { role: "leaders", label: "Leader", href: "/dashboard/admin/leaders" },
  { role: "karyawan", label: "Karyawan", href: "/dashboard/admin/karyawan" },
  { role: "managers", label: "Manajer", href: "/dashboard/admin/managers" },
] as const;

export async function UserManagementTabs({
  activeRole,
}: {
  activeRole: (typeof tabs)[number]["role"];
}) {
  const [adminCount, leaderCount, employeeCount, managerCount] = await Promise.all([
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "LEADER" } }),
    prisma.user.count({ where: { role: "KARYAWAN" } }),
    prisma.user.count({ where: { role: "MANAJER" } }),
  ]);
  const accountCounts = [
    { role: "admin", label: "Admin", count: adminCount },
    { role: "leaders", label: "Leader", count: leaderCount },
    { role: "karyawan", label: "Karyawan", count: employeeCount },
    { role: "managers", label: "Manajer", count: managerCount },
  ];

  return (
    <>
      <header className="flex flex-col gap-4 rounded-lg border border-[#e5e7eb] bg-white px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Manajemen akun</p>
          <h1 className="mt-1 text-[13px] font-semibold tracking-tight">Kelola Pengguna</h1>
          <p className="mt-1 text-xs text-[#6b7280]">Kelola akun admin, leader, karyawan, dan manajer.</p>
        </div>
        <div aria-label="Jumlah seluruh akun berdasarkan peran" className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-[min(100%,36rem)]">
          {accountCounts.map((item) => (
            <div key={item.role} className={`min-w-0 rounded-md border px-3 py-2 ${activeRole === item.role ? "border-[#111111] bg-[#f8f9fa]" : "border-[#e5e7eb] bg-white"}`}>
              <p className="truncate text-[10px] font-medium text-[#6b7280]">{item.label}</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-[#111111]">{item.count}</p>
            </div>
          ))}
        </div>
      </header>

      <nav aria-label="Jenis akun" className="flex overflow-x-auto border-b border-[#e5e7eb]">
        {tabs.map((tab) => (
          <Link
            key={tab.role}
            href={tab.href}
            aria-current={activeRole === tab.role ? "page" : undefined}
            className={`shrink-0 border-b-2 px-4 py-2.5 text-xs font-medium transition ${
              activeRole === tab.role
                ? "border-[#111111] text-[#111111]"
                : "border-transparent text-[#6b7280] hover:border-[#d1d5db] hover:text-[#111111]"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </>
  );
}