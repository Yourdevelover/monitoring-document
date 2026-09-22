import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const admin = await getSessionUser();

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const teamId = Number(formData.get("teamId") ?? "0");

  if (!name || !email || password.length < 6 || !teamId) {
    return NextResponse.json(
      { error: "Nama, email, password minimal 6 karakter, dan tim wajib diisi." },
      { status: 400 }
    );
  }

  const [existingUser, team] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.team.findUnique({ where: { id: teamId }, include: { manager: true } }),
  ]);

  if (existingUser) {
    return NextResponse.json({ error: "Email sudah digunakan." }, { status: 409 });
  }

  if (!team) {
    return NextResponse.json({ error: "Tim yang dipilih tidak ditemukan." }, { status: 404 });
  }

  const employee = await prisma.user.create({
    data: {
      name,
      email,
      phoneNumber: phoneNumber || null,
      passwordHash: await hash(password, 10),
      role: "KARYAWAN",
      isActive: "ACTIVE",
      teamId: team.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      actorId: admin.id,
      action: "CREATE_EMPLOYEE",
      targetType: "USER",
      targetId: employee.id,
      description: `Admin ${admin.email} menambahkan karyawan ${employee.email} ke tim ${team.name} dengan manajer ${team.manager.name}.`,
    },
  });

  return NextResponse.redirect(new URL("/dashboard/admin/karyawan", request.url));
}
