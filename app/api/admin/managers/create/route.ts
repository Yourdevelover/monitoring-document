import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/redirect";

export async function POST(request: Request) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const departmentId = Number(formData.get("departmentId") ?? 0);
  if (!name || !email || !/^\d{6}$/.test(password) || !Number.isInteger(departmentId) || departmentId <= 0) {
    return NextResponse.json({ error: "Nama, email, password 6 angka, dan departemen wajib diisi." }, { status: 400 });
  }
  if (await prisma.user.findUnique({ where: { email } })) return NextResponse.json({ error: "Email sudah digunakan." }, { status: 409 });
  const department = await prisma.department.findFirst({ where: { id: departmentId, isActive: true } });
  if (!department) return NextResponse.json({ error: "Departemen tidak ditemukan atau nonaktif." }, { status: 400 });
  const passwordHash = await hash(password, 10);

  const manager = await prisma.$transaction(async (tx) => {
    const createdManager = await tx.user.create({
      data: {
        name,
        email,
        phoneNumber: phoneNumber || null,
        passwordHash,
        role: "MANAJER",
        departmentId: department.id,
        isActive: "ACTIVE",
      },
    });

    await tx.activityLog.create({
      data: {
        actorId: admin.id,
        action: "CREATE_MANAGER",
        targetType: "USER",
        targetId: createdManager.id,
        description: `Admin ${admin.email} membuat akun manajer ${createdManager.email} di departemen ${department.name}.`,
      },
    });

    return createdManager;
  });
  return NextResponse.redirect(new URL(`/dashboard/admin/managers/${manager.id}`, getBaseUrl(request)));
}
