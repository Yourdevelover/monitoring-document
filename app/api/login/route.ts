import { compare } from "bcryptjs";
import { after, NextResponse } from "next/server";
import { createSessionToken, isSecureRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "monitoring_admin_session";

function getLoginFailure(error: unknown) {
  if (!(error instanceof Error)) return "Login gagal karena kesalahan server. Periksa log deployment.";

  const errorCode = "code" in error ? String(error.code) : "";
  const message = error.message.toLowerCase();

  if (error.name === "PrismaClientInitializationError" || errorCode === "P1001") {
    return "Database tidak dapat dihubungi. Periksa DATABASE_URL di Vercel dan pastikan menggunakan alamat database online, bukan localhost.";
  }
  if (errorCode === "P1000") {
    return "Kredensial database ditolak. Periksa username/password pada DATABASE_URL di Vercel.";
  }
  if (errorCode === "P1003" || errorCode === "P2021" || errorCode === "P2022") {
    return "Database belum siap atau skema belum diperbarui. Jalankan migrasi database production.";
  }
  if (message.includes("set jwt_secret or database_url") || message.includes("enable session authentication")) {
    return "Konfigurasi sesi belum lengkap. Atur JWT_SECRET di Vercel lalu deploy ulang.";
  }
  if (message.includes("invalid salt") || message.includes("invalid hash") || message.includes("illegal arguments")) {
    return "Format password akun tidak valid. Admin perlu mengatur ulang password akun tersebut.";
  }

  return "Login gagal karena kesalahan server. Periksa Vercel Runtime Logs untuk detailnya.";
}

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

    after(async () => {
      try {
      await prisma.activityLog.create({
        data: {
          actorId: user.id,
          action: "LOGIN",
          targetType: "USER",
          targetId: user.id,
          description: `${user.name} berhasil login ke dashboard.`,
        },
      });
      } catch (error) {
        console.error("Failed to record login activity:", error);
      }
    });

    return response;
  } catch (error) {
    console.error("Login endpoint failed:", {
      name: error instanceof Error ? error.name : "UnknownError",
      code: error && typeof error === "object" && "code" in error ? error.code : undefined,
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { success: false, error: getLoginFailure(error) },
      { status: 500 }
    );
  }
}
