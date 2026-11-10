import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/auth";
import { NotificationList } from "./notification-list";

export default async function EmployeeAnnouncementsPage() {
  const employee = await requireEmployee();
  const activeSince = new Date();
  activeSince.setHours(activeSince.getHours() - 12);
  const announcementWhere = {
    teamId: employee.teamId ?? 0,
    OR: [{ isPinned: true }, { createdAt: { gte: activeSince } }],
  };

  const announcements = await prisma.announcement.findMany({
    where: announcementWhere,
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: { leader: { select: { name: true, phoneNumber: true } } },
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#eef1f5_0%,#f8f9fa_52%,#edf1f5_100%)] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-7xl">
        <NotificationList announcements={announcements} />
      </div>
    </main>
  );
}
