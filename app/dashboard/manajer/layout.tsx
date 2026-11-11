import { requireManajer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationButton } from "@/app/components/notification-button";
import { LeaderSidebar } from "./leader-sidebar";

export default async function ManajerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireManajer();
  const activeSince = new Date();
  activeSince.setHours(activeSince.getHours() - 12);
  const announcements = await prisma.announcement.findMany({
    where: { OR: [{ isPinned: true }, { createdAt: { gte: activeSince } }] },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 8,
  });
  const navItems = [
    { href: "/dashboard/manajer", label: "Dashboard" },
    { href: "/dashboard/manajer/karyawan", label: "Karyawan" },
    { href: "/dashboard/manajer/pengguna", label: "Pengguna" },
    { href: "/dashboard/manajer/leader", label: "Leader" },
    { href: "/dashboard/manajer/organisasi", label: "Organisasi" },
    { href: "/dashboard/manajer/aktivitas", label: "Aktivitas" },
    { href: "/dashboard/manajer/berkas", label: "Berkas" },
    { href: "/dashboard/manajer/histori-berkas", label: "Histori Berkas" },
    { href: "/dashboard/manajer/target", label: "Target" },
    { href: "/dashboard/manajer/pengajuan-profil", label: "Pengajuan Profil" },
    { href: "/dashboard/manajer/announcement", label: "Pengumuman" },
    { href: "/dashboard/manajer/profil", label: "Profil" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="flex min-h-screen">
        <LeaderSidebar navItems={navItems} />
        <div className="leader-content min-w-0 flex-1">
          <div className="leader-announcement-bar" role="status" aria-live="polite">
            <NotificationButton href="/dashboard/manajer/announcement" count={announcements.length} />
            <div className="leader-announcement-viewport">
              {announcements.length ? (
                <p className="leader-announcement-single">
                  {announcements.map((item, index) => (
                    <span key={item.id}>
                      {index > 0 && "  ·  "}
                      {item.title ? `${item.title} - ${item.content}` : item.content}
                    </span>
                  ))}
                </p>
              ) : (
                <p className="leader-announcement-empty">Belum ada pengumuman terbaru.</p>
              )}
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
