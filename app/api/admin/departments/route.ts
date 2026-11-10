import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/redirect";

export async function POST(request: Request) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });

  const form = await request.formData();
  const action = String(form.get("action") ?? "");
  const name = String(form.get("name") ?? "").trim();

  try {
    if (action === "create") {
      if (!name) return NextResponse.json({ error: "Nama departemen wajib diisi." }, { status: 400 });
      await prisma.department.create({ data: { name } });
    } else if (action === "toggle") {
      const id = Number(form.get("id"));
      const activeValue = String(form.get("isActive"));
      if (!Number.isInteger(id) || id <= 0 || !["true", "false"].includes(activeValue)) {
        return NextResponse.json({ error: "Data departemen tidak valid." }, { status: 400 });
      }
      const department = await prisma.department.findUnique({ where: { id }, include: { _count: { select: { teams: true } } } });
      if (!department) return NextResponse.json({ error: "Departemen tidak ditemukan." }, { status: 404 });
      if (activeValue === "false" && department._count.teams > 0) {
        return NextResponse.json({ error: "Pindahkan tim ke departemen lain sebelum menonaktifkan departemen ini." }, { status: 409 });
      }
      await prisma.department.update({ where: { id }, data: { isActive: activeValue === "true" } });
    } else {
      return NextResponse.json({ error: "Aksi tidak valid." }, { status: 400 });
    }
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Nama departemen sudah digunakan." }, { status: 409 });
    }
    console.error("Department management failed:", error);
    return NextResponse.json({ error: "Gagal menyimpan departemen." }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/dashboard/admin/organization", getBaseUrl(request)), 303);
}
