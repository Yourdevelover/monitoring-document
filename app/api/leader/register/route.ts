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
    const departmentId = Number(formData.get("departmentId") ?? 0);

    if (!name || !email || !/^\d{6}$/.test(password) || !Number.isInteger(departmentId) || departmentId <= 0) {
      return NextResponse.redirect(new URL("/daftar-leader?error=invalid-input", getBaseUrl(request)), 303);
    }

    failedAt = "memeriksa email di database";
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.redirect(new URL("/daftar-leader?error=email-registered", getBaseUrl(request)), 303);
    }

    const department = await prisma.department.findFirst({ where: { id: departmentId, isActive: true } });
    if (!department) {
      return NextResponse.redirect(new URL("/daftar-leader?error=department-unavailable", getBaseUrl(request)), 303);
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
          departmentId: department.id,
          isActive: "PENDING",
        },
      });

      const team = await transaction.team.create({
        data: {
          name: `Tim ${name}`,
          leaderId: leader.id,
          departmentId: department.id,
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
    const errorUrl = new URL("/daftar-leader?error=registration-failed", getBaseUrl(request));
    return NextResponse.redirect(errorUrl, 303);
  }
}
