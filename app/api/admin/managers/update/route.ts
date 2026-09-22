import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  const formData = await request.formData();
  const userId = Number(formData.get("userId"));
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const manager = await prisma.user.findFirst({ where: { id: userId, role: "MANAGER" } });
  if (!manager) return NextResponse.json({ error: "Manajer tidak ditemukan." }, { status: 404 });
  const duplicate = await prisma.user.findFirst({ where: { email, NOT: { id: userId } } });
  if (duplicate) return NextResponse.json({ error: "Email sudah digunakan." }, { status: 409 });
  await prisma.user.update({ where: { id: userId }, data: { name, email, phoneNumber: phoneNumber || null, ...(password ? { passwordHash: await hash(password, 10) } : {}) } });
  return NextResponse.redirect(new URL(`/dashboard/admin/managers/${userId}`, request.url));
}
