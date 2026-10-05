import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/redirect";

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

    await prisma.$transaction(async (transaction) => {
      const manager = await transaction.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "MANAGER",
          isActive: "PENDING",
        },
      });

      const team = await transaction.team.create({
        data: {
          name: `Tim ${name}`,
          managerId: manager.id,
          isActive: false,
        },
      });

      await transaction.activityLog.create({
        data: {
          actorId: manager.id,
          action: "REGISTER_MANAGER_PENDING",
          targetType: "TEAM",
          targetId: team.id,
          description: `Pendaftaran manajer ${manager.email} menunggu persetujuan admin.`,
        },
      });
    });

    return NextResponse.redirect(new URL("/?registration=pending", getBaseUrl(request)));
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
