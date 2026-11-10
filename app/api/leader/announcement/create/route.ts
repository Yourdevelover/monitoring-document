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
  const leader = await getSessionUser();

  if (!leader || leader.role !== "LEADER") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const team = await prisma.team.findUnique({ where: { leaderId: leader.id } });

  if (!team) {
    return NextResponse.json({ error: "Tim leader tidak ditemukan." }, { status: 404 });
  }

  if (!content) {
    return NextResponse.json({ error: "Pesan wajib diisi." }, { status: 400 });
  }

  await prisma.announcement.create({
    data: {
      leaderId: leader.id,
      teamId: team.id,
      title,
      content,
    },
  });

  return NextResponse.redirect(new URL("/dashboard/leader/announcement", getBaseUrl(request)));
}