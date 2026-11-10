import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/redirect";

export async function POST(request: Request) {
  let failedAt = "membaca formulir";

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

    failedAt = "memeriksa email di database";
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

    failedAt = "menyimpan akun, tim, dan aktivitas ke database";
    await prisma.$transaction(async (transaction) => {
      const leader = await transaction.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "LEADER",
          isActive: "PENDING",
        },
      });

      const team = await transaction.team.create({
        data: {
          name: `Tim ${name}`,
          leaderId: leader.id,
          departmentId: (await transaction.department.findUniqueOrThrow({ where: { name: "Collection/Penagihan" } })).id,
          isActive: false,
        },
      });

      await transaction.activityLog.create({
        data: {
          actorId: leader.id,
          action: "REGISTER_LEADER_PENDING",
          targetType: "TEAM",
          targetId: team.id,
          description: `Pendaftaran leader ${leader.email} menunggu persetujuan admin.`,
        },
      });
    });

    failedAt = "membuat respons pendaftaran";
    return NextResponse.redirect(new URL("/?registration=pending", getBaseUrl(request)));
  } catch (error) {
    const errorCode =
      typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
        ? error.code
        : "UNKNOWN";
    console.error("Leader registration failed:", { failedAt, errorCode, error });
    return NextResponse.json(
      {
        success: false,
        error: `Pendaftaran gagal saat ${failedAt} (kode: ${errorCode}).`,
      },
      { status: 500 }
    );
  }
}
