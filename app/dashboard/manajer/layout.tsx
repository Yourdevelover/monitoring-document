import { requireLeader } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationButton } from "@/app/components/notification-button";
import { LeaderSidebar } from "./leader-sidebar";

export default async function LeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const leader = await requireLeader();
  const activeSince = new Date();
  activeSince.setHours(activeSince.getHours() - 12);
  const team = await prisma.team.findUnique({
    where: { leaderId: leader.id },
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
    { href: "/dashboard/leader", label: "Dashboard" },
    { href: "/dashboard/leader/karyawan", label: "Karyawan" },
    { href: "/dashboard/leader/berkas", label: "Berkas" },
    { href: "/dashboard/leader/histori-berkas", label: "Histori Berkas" },
    { href: "/dashboard/leader/target", label: "Target" },
    { href: "/dashboard/leader/pengajuan-profil", label: "Persetujuan Profil" },
    { href: "/dashboard/leader/profil", label: "Profil" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="flex min-h-screen">
        <LeaderSidebar navItems={navItems} />
        <div className="leader-content min-w-0 flex-1">
          <div className="leader-announcement-bar" role="status" aria-live="polite">
            <NotificationButton href="/dashboard/manajer/announcement" count={announcements.length} />
            <div className="leader-announcement-viewport">
              {announcements.length > 0 ? (
                <p className="leader-announcement-single">
                  {announcements.map((announcement, index) => (
                    <span key={announcement.id}>
                      {index > 0 && "  •  "}
                      <span className={announcement.isPinned ? "leader-announcement-important" : undefined}>
                        {announcement.title
                          ? `${announcement.title} - ${announcement.content}`
                          : announcement.content}
                      </span>
                    </span>
                  ))}
                </p>
              ) : (
                <p className="leader-announcement-empty">Belum ada announcement terbaru dari leader.</p>
              )}
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
