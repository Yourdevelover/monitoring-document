import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Akun manajer hanya dapat dibuat oleh admin." }, { status: 403 });
}
