import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

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

    if (!name || !email || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Nama, email, dan password wajib diisi dengan password minimal 6 karakter.",
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

    const passwordHash = await hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN",
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

    return NextResponse.redirect(new URL("/dashboard/admin", request.url));
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
