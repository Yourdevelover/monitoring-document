import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getBaseUrl(request: Request) {
  const host = request.headers.get("host") ?? "localhost:3000";
  const safeHost = host.replace(/^0\.0\.0\.0/, "localhost");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${safeHost}`;
}

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

  await prisma.announcement.update({
    where: { id: announcement.id },
    data: { isPinned: !announcement.isPinned },
  });

  return NextResponse.redirect(new URL("/dashboard/manajer/pengumuman", getBaseUrl(request)));
}