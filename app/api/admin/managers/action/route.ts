import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/redirect";

export async function POST(request: Request) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  const formData = await request.formData();
  const userId = Number(formData.get("userId"));
  const action = String(formData.get("action") ?? "");
  const leader = await prisma.user.findFirst({ where: { id: userId, role: "LEADER" }, include: { ledTeam: true } });
  if (!leader) return NextResponse.json({ error: "Leader tidak ditemukan." }, { status: 404 });

  if (action === "approve" || action === "reject") {
    if (leader.isActive !== "PENDING") {
      return NextResponse.redirect(new URL("/dashboard/admin/leaders", getBaseUrl(request)));
    }

    const approved = action === "approve";
    await prisma.$transaction(async (transaction) => {
      const updated = await transaction.user.updateMany({
        where: { id: userId, role: "LEADER", isActive: "PENDING" },
        data: { isActive: approved ? "ACTIVE" : "REJECTED" },
      });
      if (updated.count === 0) return;

      await transaction.team.updateMany({
        where: { leaderId: userId },
        data: { isActive: approved },
      });
      await transaction.activityLog.create({
        data: {
          actorId: admin.id,
          action: approved ? "APPROVE_LEADER" : "REJECT_LEADER",
          targetType: "USER",
          targetId: userId,
          description: `Admin ${admin.email} ${approved ? "menyetujui" : "menolak"} pendaftaran leader ${leader.email}.`,
        },
      });
    });
  } else if (action === "deactivate") {
    await prisma.user.update({ where: { id: userId }, data: { isActive: "INACTIVE" } });
  } else if (action === "activate") {
    await prisma.user.update({ where: { id: userId }, data: { isActive: "ACTIVE" } });
  } else if (action === "delete") {
    if (leader.ledTeam) return NextResponse.json({ error: "Leader masih memiliki tim. Nonaktifkan akun terlebih dahulu." }, { status: 409 });
    await prisma.user.delete({ where: { id: userId } });
  } else {
    return NextResponse.json({ error: "Aksi tidak valid." }, { status: 400 });
  }

  return NextResponse.redirect(new URL("/dashboard/admin/leaders", getBaseUrl(request)));
}
