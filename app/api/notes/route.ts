import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseTargetNote } from "@/lib/notes";
import { Prisma } from "@prisma/client";

async function getUser() {
  return getSessionUser();
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    if (user.role === "MANAJER") return NextResponse.json({ error: "Akun manajer hanya memiliki akses baca." }, { status: 403 });

    const body = await request.json();
    const content = String(body.content ?? "").trim();
    if (!content) return NextResponse.json({ error: "Catatan tidak boleh kosong." }, { status: 400 });

    const [result] = await prisma.$queryRaw<Array<{ note: { id: number; content: string; createdAt: string; updatedAt: string } }>>(
      Prisma.sql`UPDATE users SET "personalNotes" = COALESCE("personalNotes", '[]'::jsonb) || jsonb_build_array(jsonb_build_object('id', COALESCE((SELECT MAX((item->>'id')::int) FROM jsonb_array_elements(COALESCE("personalNotes", '[]'::jsonb)) AS item), 0) + 1, 'content', ${content}, 'createdAt', NOW(), 'updatedAt', NOW())) WHERE id = ${user.id} RETURNING "personalNotes" -> -1 AS note`
    );
    const note = {
      ...result.note,
      createdAt: new Date(result.note.createdAt),
      updatedAt: new Date(result.note.updatedAt),
    };
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
  if (user.role === "MANAJER") return NextResponse.json({ error: "Akun manajer hanya memiliki akses baca." }, { status: 403 });

  const body = await request.json();
  const noteId = Number(body.id);
  const content = String(body.content ?? "").trim();
  if (!noteId || !content) return NextResponse.json({ error: "Catatan tidak valid." }, { status: 400 });

  const [existingNote] = await prisma.$queryRaw<Array<{ content: string }>>(
    Prisma.sql`SELECT item->>'content' AS content FROM users, jsonb_array_elements(COALESCE("personalNotes", '[]'::jsonb)) AS item WHERE users.id = ${user.id} AND (item->>'id')::int = ${noteId}`
  );
  if (!existingNote) return NextResponse.json({ error: "Catatan tidak ditemukan." }, { status: 404 });
  if (parseTargetNote(existingNote.content)) {
    return NextResponse.json({ error: "Catatan target tidak dapat diedit." }, { status: 403 });
  }

  const [updatedUser] = await prisma.$queryRaw<Array<{ updated: boolean }>>(
    Prisma.sql`UPDATE users SET "personalNotes" = COALESCE((SELECT jsonb_agg(CASE WHEN (item->>'id')::int = ${noteId} THEN item || jsonb_build_object('content', ${content}, 'updatedAt', NOW()) ELSE item END ORDER BY ordinal) FROM jsonb_array_elements(COALESCE("personalNotes", '[]'::jsonb)) WITH ORDINALITY AS notes(item, ordinal)), '[]'::jsonb) WHERE id = ${user.id} AND EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE("personalNotes", '[]'::jsonb)) AS item WHERE (item->>'id')::int = ${noteId}) RETURNING true AS updated`
  );
  if (!updatedUser) return NextResponse.json({ error: "Catatan tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  if (user.role === "MANAJER") return NextResponse.json({ error: "Akun manajer hanya memiliki akses baca." }, { status: 403 });

  const body = await request.json();
  const noteId = Number(body.id);
  if (!noteId) return NextResponse.json({ error: "Catatan tidak valid." }, { status: 400 });

  const [updatedUser] = await prisma.$queryRaw<Array<{ updated: boolean }>>(
    Prisma.sql`UPDATE users SET "personalNotes" = COALESCE((SELECT jsonb_agg(item ORDER BY ordinal) FROM jsonb_array_elements(COALESCE("personalNotes", '[]'::jsonb)) WITH ORDINALITY AS notes(item, ordinal) WHERE (item->>'id')::int <> ${noteId}), '[]'::jsonb) WHERE id = ${user.id} AND EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE("personalNotes", '[]'::jsonb)) AS item WHERE (item->>'id')::int = ${noteId}) RETURNING true AS updated`
  );
  if (!updatedUser) return NextResponse.json({ error: "Catatan tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ success: true });
}