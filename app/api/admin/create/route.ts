import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getBaseUrl } from "@/lib/redirect";

export async function POST(request: Request) {
  try {
    const adminUser = await getSessionUser();

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Akses ditolak.",
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const departmentId = Number(formData.get("departmentId") ?? 0);

    if (!name || !email || !/^\d{6}$/.test(password) || !Number.isInteger(departmentId) || departmentId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Nama, email, departemen, dan password 6 angka wajib diisi.",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Email sudah terdaftar.",
        },
        { status: 409 }
      );
    }

    const department = await prisma.department.findFirst({ where: { id: departmentId, isActive: true } });
    if (!department) {
      return NextResponse.json({ success: false, error: "Departemen tidak ditemukan atau nonaktif." }, { status: 400 });
    }

    const passwordHash = await hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN",
        departmentId: department.id,
        isActive: "ACTIVE",
      },
    });

    await prisma.activityLog.create({
      data: {
        actorId: adminUser.id,
        action: "CREATE_ADMIN",
        targetType: "USER",
        targetId: newAdmin.id,
        description: `Admin baru dibuat: ${newAdmin.email}`,
      },
    });

    return NextResponse.redirect(new URL("/dashboard/admin", getBaseUrl(request)));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server saat membuat admin baru.",
      },
      { status: 500 }
    );
  }
}
