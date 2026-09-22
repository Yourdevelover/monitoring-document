import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  const navItems = [
    { href: "/dashboard/admin", label: "Dashboard" },
    { href: "/dashboard/admin/users", label: "Kelola Admin" },
    { href: "/dashboard/admin/managers", label: "Kelola Manajer" },
    { href: "/dashboard/admin/karyawan", label: "Kelola Karyawan" },
    { href: "/dashboard/admin/activities", label: "Aktivitas" },
    { href: "/dashboard/admin/profil", label: "Profil" },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <AdminSidebar navItems={navItems} />
        <div className="admin-content min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
