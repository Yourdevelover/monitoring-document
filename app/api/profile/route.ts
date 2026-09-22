import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    }

    const formData = await request.formData();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();

    if (!name || !email) {
      return NextResponse.json({ error: "Nama dan email wajib diisi." }, { status: 400 });
    }

    if (password && password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
    }

    const existingEmail = await prisma.user.findFirst({
      where: { email, NOT: { id: user.id } },
    });
    if (existingEmail) {
      return NextResponse.json({ error: "Email sudah digunakan." }, { status: 409 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        email,
        phoneNumber: phoneNumber || null,
        ...(password ? { passwordHash: await hash(password, 10) } : {}),
      },
    });

    const dashboardRole = user.role === "ADMIN" ? "admin" : user.role === "MANAGER" ? "manajer" : "karyawan";
    return NextResponse.redirect(new URL(`/dashboard/${dashboardRole}/profil`, request.url));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memperbarui profil." }, { status: 500 });
  }
}
