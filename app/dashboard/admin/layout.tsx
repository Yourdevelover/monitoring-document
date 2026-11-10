import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  const navItems = [
    { href: "/dashboard/admin", label: "Dashboard" },
    { href: "/dashboard/admin/users", label: "Kelola Pengguna" },
    { href: "/dashboard/admin/organization", label: "Kelola Organisasi" },
    { href: "/dashboard/admin/activities", label: "Aktivitas" },
    { href: "/dashboard/admin/profil", label: "Profil" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="flex min-h-screen">
        <AdminSidebar navItems={navItems} />
        <div className="admin-content min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
