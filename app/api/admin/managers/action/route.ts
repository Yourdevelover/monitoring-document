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
  const manager = await prisma.user.findFirst({ where: { id: userId, role: "MANAGER" }, include: { managedTeam: true } });
  if (!manager) return NextResponse.json({ error: "Manajer tidak ditemukan." }, { status: 404 });

  if (action === "approve" || action === "reject") {
    if (manager.isActive !== "PENDING") {
      return NextResponse.redirect(new URL("/dashboard/admin/managers", getBaseUrl(request)));
    }

    const approved = action === "approve";
    await prisma.$transaction(async (transaction) => {
      const updated = await transaction.user.updateMany({
        where: { id: userId, role: "MANAGER", isActive: "PENDING" },
        data: { isActive: approved ? "ACTIVE" : "REJECTED" },
      });
      if (updated.count === 0) return;

      await transaction.team.updateMany({
        where: { managerId: userId },
        data: { isActive: approved },
      });
      await transaction.activityLog.create({
        data: {
          actorId: admin.id,
          action: approved ? "APPROVE_MANAGER" : "REJECT_MANAGER",
          targetType: "USER",
          targetId: userId,
          description: `Admin ${admin.email} ${approved ? "menyetujui" : "menolak"} pendaftaran manajer ${manager.email}.`,
        },
      });
    });
  } else if (action === "deactivate") {
    await prisma.user.update({ where: { id: userId }, data: { isActive: "INACTIVE" } });
  } else if (action === "activate") {
    await prisma.user.update({ where: { id: userId }, data: { isActive: "ACTIVE" } });
  } else if (action === "delete") {
    if (manager.managedTeam) return NextResponse.json({ error: "Manajer masih memiliki tim. Nonaktifkan akun terlebih dahulu." }, { status: 409 });
    await prisma.user.delete({ where: { id: userId } });
  } else {
    return NextResponse.json({ error: "Aksi tidak valid." }, { status: 400 });
  }

  return NextResponse.redirect(new URL("/dashboard/admin/managers", getBaseUrl(request)));
}
