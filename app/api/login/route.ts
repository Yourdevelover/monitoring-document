import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "monitoring_admin_session";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email dan password wajib diisi.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.isActive !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          error: "Akun tidak ditemukan atau tidak aktif.",
        },
        { status: 401 }
      );
    }

    const isPasswordValid = await compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Password salah.",
        },
        { status: 401 }
      );
    }

    const token = await createSessionToken(user.id);

    let redirectPath = "/";

    if (user.role === "ADMIN") {
      redirectPath = "/dashboard/admin";
    } else if (user.role === "MANAGER") {
      redirectPath = "/dashboard/manajer";
    } else if (user.role === "KARYAWAN") {
      redirectPath = "/dashboard/karyawan";
    }

    const response = NextResponse.redirect(new URL(redirectPath, request.url));

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    await prisma.activityLog.create({
      data: {
        actorId: user.id,
        action: "LOGIN",
        targetType: "USER",
        targetId: user.id,
        description: `${user.name} berhasil login ke dashboard.`,
      },
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server saat login.",
      },
      { status: 500 }
    );
  }
}
