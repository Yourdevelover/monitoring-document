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

    if (!userId || userId === adminUser.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Tidak bisa menghapus akun admin yang sedang login.",
        },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    await prisma.activityLog.create({
      data: {
        actorId: adminUser.id,
        action: "DELETE_ADMIN",
        targetType: "USER",
        targetId: targetUser.id,
        description: `Admin dihapus: ${targetUser.email}`,
      },
    });

    return NextResponse.redirect(new URL("/dashboard/admin/users", request.url));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan saat menghapus admin.",
      },
      { status: 500 }
    );
  }
}
