import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const manager = await getSessionUser();

  if (!manager || manager.role !== "MANAGER") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const formData = await request.formData();
  const announcementId = Number(formData.get("announcementId") ?? 0);

  if (!announcementId) {
    return NextResponse.json({ error: "ID pengumuman tidak valid." }, { status: 400 });
  }

  const announcement = await prisma.announcement.findFirst({
    where: {
      id: announcementId,
      managerId: manager.id,
    },
  });

  if (!announcement) {
    return NextResponse.json(
      { error: "Pengumuman tidak ditemukan atau bukan milik Anda." },
      { status: 404 }
    );
  }

  await prisma.announcement.delete({ where: { id: announcement.id } });

  return NextResponse.redirect(new URL("/dashboard/manajer/pengumuman", request.url));
}