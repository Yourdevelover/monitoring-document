import { requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ManagerSidebar } from "./manager-sidebar";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const manager = await requireManager();
  const activeSince = new Date();
  activeSince.setHours(activeSince.getHours() - 12);
  const team = await prisma.team.findUnique({
    where: { managerId: manager.id },
    include: {
      announcements: {
        where: {
          OR: [{ isPinned: true }, { createdAt: { gte: activeSince } }],
        },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      },
    },
  });
  const announcements = team?.announcements ?? [];

  const navItems = [
    { href: "/dashboard/manajer", label: "Dashboard" },
    { href: "/dashboard/manajer/karyawan", label: "Karyawan" },
    { href: "/dashboard/manajer/berkas", label: "Berkas" },
    { href: "/dashboard/manajer/histori-berkas", label: "Histori Berkas" },
    { href: "/dashboard/manajer/pengumuman", label: "Pengumuman" },
    { href: "/dashboard/manajer/target", label: "Target" },
    { href: "/dashboard/manajer/pengajuan-profil", label: "Persetujuan Profil" },
    { href: "/dashboard/manajer/profil", label: "Profil" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="flex min-h-screen">
        <ManagerSidebar navItems={navItems} />
        <div className="manager-content min-w-0 flex-1">
          <div className="manager-announcement-bar" role="status" aria-live="polite">
            <span className="manager-announcement-label">Pengumuman Tim</span>
            <div className="manager-announcement-viewport">
              {announcements.length > 0 ? (
                <p className="manager-announcement-single">
                  {announcements.map((announcement, index) => (
                    <span key={announcement.id}>
                      {index > 0 && "  •  "}
                      <span className={announcement.isPinned ? "manager-announcement-important" : undefined}>
                        {announcement.title
                          ? `${announcement.title} - ${announcement.content}`
                          : announcement.content}
                      </span>
                    </span>
                  ))}
                </p>
              ) : (
                <p className="manager-announcement-empty">Belum ada pengumuman terbaru dari manajer.</p>
              )}
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
