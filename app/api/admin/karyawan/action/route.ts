import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const admin = await getSessionUser();

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const formData = await request.formData();
  const userId = Number(formData.get("userId"));
  const action = String(formData.get("action") ?? "");

  const employee = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!employee || employee.role !== "KARYAWAN") {
    return NextResponse.json({ error: "Karyawan tidak ditemukan." }, { status: 404 });
  }

  if (action === "deactivate") {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: "INACTIVE" },
    });
  } else if (action === "activate") {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: "ACTIVE" },
    });
  } else if (action === "delete") {
    await prisma.$transaction(async (tx) => {
      await tx.message.deleteMany({
        where: {
          OR: [{ senderId: userId }, { recipientId: userId }],
        },
      });

      await tx.profileRequest.deleteMany({
        where: { userId },
      });

      await tx.upload.deleteMany({
        where: { userId },
      });

      await tx.activityLog.deleteMany({
        where: { actorId: userId },
      });

      await tx.announcement.deleteMany({
        where: { targetUserId: userId },
      });

      await tx.user.delete({
        where: { id: userId },
      });
    });
  } else {
    return NextResponse.json({ error: "Aksi tidak valid." }, { status: 400 });
  }

  return NextResponse.redirect(new URL("/dashboard/admin/karyawan", request.url));
}
