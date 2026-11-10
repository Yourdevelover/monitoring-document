import Link from "next/link";

const tabs = [
  { role: "admin", label: "Admin", href: "/dashboard/admin/users" },
  { role: "leaders", label: "Leader", href: "/dashboard/admin/leaders" },
  { role: "karyawan", label: "Karyawan", href: "/dashboard/admin/karyawan" },
] as const;

export function UserManagementTabs({ activeRole }: { activeRole: (typeof tabs)[number]["role"] }) {
  return (
    <>
      <header className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Manajemen akun</p>
        <h1 className="mt-1 text-[13px] font-semibold tracking-tight">Kelola Pengguna</h1>
        <p className="mt-1 text-xs text-[#6b7280]">Kelola akun admin, leader, dan karyawan dalam satu tempat.</p>
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