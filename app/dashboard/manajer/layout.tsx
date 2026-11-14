import { requireManajer } from "@/lib/auth";
import { ManagerSidebar } from "./leader-sidebar";

export default async function ManajerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireManajer();
  const navItems = [
    { href: "/dashboard/manajer", label: "Dashboard" },
    { href: "/dashboard/manajer/pengguna", label: "Data & Kinerja" },
    { href: "/dashboard/manajer/organisasi", label: "Organisasi" },
    { href: "/dashboard/manajer/profil", label: "Profil Saya" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="flex min-h-screen">
        <ManagerSidebar navItems={navItems} />
        <div className="leader-content min-w-0 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
