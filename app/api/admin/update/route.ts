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
    const userId = Number(formData.get("userId") ?? "0");
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!userId || !name || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Nama dan email wajib diisi.",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const duplicateEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (duplicateEmail && duplicateEmail.id !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Email sudah digunakan oleh user lain.",
        },
        { status: 409 }
      );
    }

    const updateData: {
      name: string;
      email: string;
      phoneNumber: string | null;
      passwordHash?: string;
    } = {
      name,
      email,
      phoneNumber: phoneNumber || null,
    };

    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          {
            success: false,
            error: "Password minimal 6 karakter.",
          },
          { status: 400 }
        );
      }

      updateData.passwordHash = await hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    await prisma.activityLog.create({
      data: {
        actorId: adminUser.id,
        action: "UPDATE_ADMIN",
        targetType: "USER",
        targetId: updatedUser.id,
        description: `Admin diperbarui: ${updatedUser.email}`,
      },
    });

    return NextResponse.redirect(new URL(`/dashboard/admin/users/${userId}`, request.url));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server saat memperbarui admin.",
      },
      { status: 500 }
    );
  }
}
