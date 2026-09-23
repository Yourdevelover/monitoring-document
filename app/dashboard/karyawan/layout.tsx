import { requireEmployee } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { KaryawanSidebar } from "./karyawan-sidebar";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const employee = await requireEmployee();
  const activeSince = new Date();
  activeSince.setHours(activeSince.getHours() - 12);
  const announcements = employee.teamId
    ? await prisma.announcement.findMany({
        where: {
          teamId: employee.teamId,
          OR: [{ isPinned: true }, { createdAt: { gte: activeSince } }],
        },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      })
    : [];

  const navItems = [
    { href: "/dashboard/karyawan", label: "Dashboard" },
    { href: "/dashboard/karyawan/berkas", label: "Berkas" },
    { href: "/dashboard/karyawan/data-penting", label: "Data Penting" },
    { href: "/dashboard/karyawan/pengumuman", label: "Pengumuman" },
    { href: "/dashboard/karyawan/target", label: "Target" },
    { href: "/dashboard/karyawan/profil", label: "Profil" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="flex min-h-screen">
        <KaryawanSidebar navItems={navItems} />

        <div className="employee-content min-w-0 flex-1">
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
