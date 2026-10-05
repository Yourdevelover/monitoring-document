import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { createSessionToken, isSecureRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "monitoring_admin_session";

export async function POST(request: Request) {
  try {
    let email = "";
    let password = "";
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      email = String(formData.get("email") ?? "").trim().toLowerCase();
      password = String(formData.get("password") ?? "");
    } else {
      const text = await request.text();
      const params = new URLSearchParams(text);
      email = String(params.get("email") ?? "").trim().toLowerCase();
      password = String(params.get("password") ?? "");
    }

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.isActive !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "Akun tidak ditemukan atau tidak aktif." },
        { status: 401 }
      );
    }

    const isPasswordValid = await compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Password salah." },
        { status: 401 }
      );
    }

    const token = await createSessionToken(user.id);

    let redirect = "/dashboard/karyawan";
    if (user.role === "ADMIN") redirect = "/dashboard/admin";
    else if (user.role === "MANAGER") redirect = "/dashboard/manajer";

    const response = NextResponse.json({ success: true, redirect });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureRequest(request),
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
      { success: false, error: "Terjadi kesalahan server saat login." },
      { status: 500 }
    );
  }
}
