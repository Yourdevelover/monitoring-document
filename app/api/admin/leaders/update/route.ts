import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/redirect";

export async function POST(request: Request) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  const formData = await request.formData();
  const userId = Number(formData.get("userId"));
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const departmentId = Number(formData.get("departmentId") ?? 0);
  const leader = await prisma.user.findFirst({ where: { id: userId, role: "LEADER" } });
  if (!leader) return NextResponse.json({ error: "Leader tidak ditemukan." }, { status: 404 });
  const duplicate = await prisma.user.findFirst({ where: { email, NOT: { id: userId } } });
  if (duplicate) return NextResponse.json({ error: "Email sudah digunakan." }, { status: 409 });
  if (!Number.isInteger(departmentId) || !await prisma.department.findFirst({ where: { id: departmentId, isActive: true } })) return NextResponse.json({ error: "Departemen tidak ditemukan atau nonaktif." }, { status: 400 });
  await prisma.user.update({ where: { id: userId }, data: { name, email, phoneNumber: phoneNumber || null, ...(password ? { passwordHash: await hash(password, 10) } : {}) } });
  await prisma.team.updateMany({ where: { leaderId: userId }, data: { departmentId } });
  return NextResponse.redirect(new URL(`/dashboard/admin/leaders/${userId}`, getBaseUrl(request)));
}
