import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const manager = await getSessionUser();

  if (!manager || manager.role !== "MANAGER") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const team = await prisma.team.findUnique({ where: { managerId: manager.id } });

  if (!team) {
    return NextResponse.json({ error: "Tim manager tidak ditemukan." }, { status: 404 });
  }

  if (!content) {
    return NextResponse.json({ error: "Pesan wajib diisi." }, { status: 400 });
  }

  await prisma.announcement.create({
    data: {
      managerId: manager.id,
      teamId: team.id,
      title,
      content,
    },
  });

  return NextResponse.redirect(new URL("/dashboard/manajer/pengumuman", request.url));
}