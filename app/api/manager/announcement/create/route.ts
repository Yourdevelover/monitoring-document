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

  return NextResponse.redirect(new URL("/dashboard/manajer/pengumuman", getBaseUrl(request)));
}