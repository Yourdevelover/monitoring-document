import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  const formData = await request.formData();
  const userId = Number(formData.get("userId"));
  const action = String(formData.get("action") ?? "");
  const manager = await prisma.user.findFirst({ where: { id: userId, role: "MANAGER" }, include: { managedTeam: true } });
  if (!manager) return NextResponse.json({ error: "Manajer tidak ditemukan." }, { status: 404 });

  if (action === "deactivate") {
    await prisma.user.update({ where: { id: userId }, data: { isActive: "INACTIVE" } });
  } else if (action === "activate") {
    await prisma.user.update({ where: { id: userId }, data: { isActive: "ACTIVE" } });
  } else if (action === "delete") {
    if (manager.managedTeam) return NextResponse.json({ error: "Manajer masih memiliki tim. Nonaktifkan akun terlebih dahulu." }, { status: 409 });
    await prisma.user.delete({ where: { id: userId } });
  } else {
    return NextResponse.json({ error: "Aksi tidak valid." }, { status: 400 });
  }

  return NextResponse.redirect(new URL("/dashboard/admin/managers", request.url));
}
