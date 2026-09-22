import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!name || !email || password.length < 6) return NextResponse.json({ error: "Nama, email, dan password minimal 6 karakter wajib diisi." }, { status: 400 });
  if (await prisma.user.findUnique({ where: { email } })) return NextResponse.json({ error: "Email sudah digunakan." }, { status: 409 });
  const passwordHash = await hash(password, 10);

  await prisma.$transaction(async (tx) => {
    const manager = await tx.user.create({
      data: {
        name,
        email,
        phoneNumber: phoneNumber || null,
        passwordHash,
        role: "MANAGER",
        isActive: "ACTIVE",
      },
    });

    const team = await tx.team.create({
      data: {
        name: `Tim ${name}`,
        managerId: manager.id,
        isActive: true,
      },
    });

    await tx.activityLog.create({
      data: {
        actorId: admin.id,
        action: "CREATE_MANAGER",
        targetType: "TEAM",
        targetId: team.id,
        description: `Admin ${admin.email} membuat manajer ${manager.email} dan tim ${team.name}.`,
      },
    });
  });
  return NextResponse.redirect(new URL("/dashboard/admin/managers", request.url));
}
