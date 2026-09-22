import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
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

    const manager = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "MANAGER",
        isActive: "ACTIVE",
      },
    });

    const team = await prisma.team.create({
      data: {
        name: `Tim ${name}`,
        managerId: manager.id,
        isActive: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        actorId: manager.id,
        action: "REGISTER_MANAGER",
        targetType: "TEAM",
        targetId: team.id,
        description: `Manager ${manager.email} berhasil mendaftar dan otomatis membuat tim ${team.name}.`,
      },
    });

    const token = await createSessionToken(manager.id);
    const response = NextResponse.redirect(new URL("/dashboard/manajer", request.url));

    response.cookies.set("monitoring_admin_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server saat mendaftar manajer.",
      },
      { status: 500 }
    );
  }
}
