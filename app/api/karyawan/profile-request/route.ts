import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { requireEmployee } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/redirect";
import { profileRequestsJson, readProfileRequests, type ProfileRequestRecord } from "@/lib/profile-requests";

export async function POST(request: Request) {
  try {
    const employee = await requireEmployee();

    const formData = await request.formData();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
    const nik = String(formData.get("nik") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();

    const profile = await prisma.user.findUnique({
      where: { id: employee.id },
    });

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: "Profil karyawan tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    if (email && email !== profile.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: "Email sudah digunakan oleh akun lain.",
          },
          { status: 400 }
        );
      }
    }

    if (nik && nik !== profile.nik) {
      const existingNik = await prisma.user.findFirst({ where: { nik, NOT: { id: employee.id } } });
      if (existingNik) {
        return NextResponse.json({ success: false, error: "NIK sudah digunakan oleh akun lain." }, { status: 409 });
      }
    }

    if (password && password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Password baru minimal 6 karakter.",
        },
        { status: 400 }
      );
    }

    const oldValuePayload: Record<string, string> = {};
    const newValuePayload: Record<string, string | null> = {};

    if (name && name !== profile.name) {
      oldValuePayload.name = profile.name;
      newValuePayload.name = name;
    }

    if (email && email !== profile.email) {
      oldValuePayload.email = profile.email;
      newValuePayload.email = email;
    }

    if (phoneNumber !== (profile.phoneNumber ?? "")) {
      oldValuePayload.phoneNumber = profile.phoneNumber ?? "";
      newValuePayload.phoneNumber = phoneNumber || null;
    }

    if (nik !== (profile.nik ?? "")) {
      oldValuePayload.nik = profile.nik ?? "";
      newValuePayload.nik = nik || null;
    }

    if (password) {
      newValuePayload.passwordHash = await hash(password, 10);
    }

    if (Object.keys(newValuePayload).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Tidak ada perubahan yang perlu diajukan.",
        },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw`SELECT "id" FROM "users" WHERE "id" = ${employee.id} FOR UPDATE`;
      const currentUser = await transaction.user.findUnique({
        where: { id: employee.id },
        select: { profileRequests: true },
      });
      if (!currentUser) throw new Error("Profil karyawan tidak ditemukan.");

      const now = new Date().toISOString();
      const profileRequest: ProfileRequestRecord = {
        id: crypto.randomUUID(),
        userId: employee.id,
        fieldName: "profile",
        oldValue: JSON.stringify(oldValuePayload),
        newValue: JSON.stringify(newValuePayload),
        status: "PENDING",
        reviewerId: null,
        reviewNote: null,
        createdAt: now,
        updatedAt: now,
      };
      const requests = readProfileRequests(currentUser.profileRequests)
        .filter((item) => item.status !== "PENDING");

      await transaction.user.update({
        where: { id: employee.id },
        data: { profileRequests: profileRequestsJson([...requests, profileRequest]) },
      });
    });

    return NextResponse.redirect(new URL("/dashboard/karyawan/profil?toast=" + encodeURIComponent("Pengajuan perubahan profil berhasil dikirim ke leader."), getBaseUrl(request)));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server saat mengajukan perubahan profil.",
      },
      { status: 500 }
    );
  }
}
