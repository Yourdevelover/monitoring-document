import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

async function getUser() {
  return getSessionUser();
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });

    const body = await request.json();
    const content = String(body.content ?? "").trim();
    if (!content) return NextResponse.json({ error: "Catatan tidak boleh kosong." }, { status: 400 });

    const [note] = await prisma.$queryRaw<Array<{ id: number; content: string; createdAt: Date; updatedAt: Date }>>(
      Prisma.sql`INSERT INTO personal_notes ("userId", content, "updatedAt") VALUES (${user.id}, ${content}, NOW()) RETURNING id, content, "createdAt", "updatedAt"`
    );
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : "Catatan gagal disimpan." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });

  const body = await request.json();
  const noteId = Number(body.id);
  const content = String(body.content ?? "").trim();
  if (!noteId || !content) return NextResponse.json({ error: "Catatan tidak valid." }, { status: 400 });

  const note = await prisma.$executeRaw(
    Prisma.sql`UPDATE personal_notes SET content = ${content}, "updatedAt" = NOW() WHERE id = ${noteId} AND "userId" = ${user.id}`
  );
  if (note === 0) return NextResponse.json({ error: "Catatan tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });

  const body = await request.json();
  const noteId = Number(body.id);
  if (!noteId) return NextResponse.json({ error: "Catatan tidak valid." }, { status: 400 });

  const note = await prisma.$executeRaw(
    Prisma.sql`DELETE FROM personal_notes WHERE id = ${noteId} AND "userId" = ${user.id}`
  );
  if (note === 0) return NextResponse.json({ error: "Catatan tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ success: true });
}