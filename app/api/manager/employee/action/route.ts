import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const manager = await getSessionUser();

  if (!manager || manager.role !== "MANAGER") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const formData = await request.formData();
  const userId = Number(formData.get("userId"));
  const action = String(formData.get("action") ?? "");
  const team = await prisma.team.findUnique({ where: { managerId: manager.id } });
  const employee = team && userId
    ? await prisma.user.findFirst({ where: { id: userId, teamId: team.id, role: "KARYAWAN" } })
    : null;

  if (!employee) {
    return NextResponse.json({ error: "Karyawan tidak ditemukan." }, { status: 404 });
  }

  if (action === "deactivate") {
    await prisma.user.update({ where: { id: employee.id }, data: { isActive: "INACTIVE" } });
  } else if (action === "delete") {
    await prisma.$transaction(async (tx) => {
      await tx.message.deleteMany({ where: { OR: [{ senderId: employee.id }, { recipientId: employee.id }] } });
      await tx.profileRequest.deleteMany({ where: { OR: [{ userId: employee.id }, { reviewerId: employee.id }] } });
      await tx.upload.deleteMany({ where: { userId: employee.id } });
      await tx.activityLog.deleteMany({ where: { actorId: employee.id } });
      await tx.announcement.deleteMany({ where: { targetUserId: employee.id } });
      await tx.user.delete({ where: { id: employee.id } });
    });
  } else {
    return NextResponse.json({ error: "Aksi tidak valid." }, { status: 400 });
  }

  return NextResponse.redirect(new URL("/dashboard/manajer/karyawan", request.url));
}