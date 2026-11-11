import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/redirect";

export async function POST(request: Request) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  const formData = await request.formData();
  const userId = Number(formData.get("userId"));
  const action = String(formData.get("action") ?? "");
  const manager = await prisma.user.findFirst({ where: { id: userId, role: "MANAJER" } });
  if (!manager) return NextResponse.json({ error: "Manajer tidak ditemukan." }, { status: 404 });

  if (action === "deactivate" || action === "activate") {
    if (action === "deactivate" && manager.departmentId) {
      const activeEmployees = await prisma.user.count({
        where: {
          role: "KARYAWAN",
          isActive: "ACTIVE",
          OR: [
            { departmentId: manager.departmentId },
            { team: { departmentId: manager.departmentId } },
          ],
        },
      });
      if (activeEmployees > 0) {
        const blockedUrl = new URL("/dashboard/admin/managers", getBaseUrl(request));
        blockedUrl.searchParams.set("toast", `Manajer tidak dapat dinonaktifkan karena masih ada ${activeEmployees} karyawan aktif di departemennya.`);
        blockedUrl.searchParams.set("toastType", "error");
        return NextResponse.redirect(blockedUrl);
      }
    }
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: action === "activate" ? "ACTIVE" : "INACTIVE" },
    });
    await prisma.activityLog.create({
      data: {
        actorId: admin.id,
        action: action === "activate" ? "ACTIVATE_MANAGER" : "DEACTIVATE_MANAGER",
        targetType: "USER",
        targetId: userId,
        description: `Admin ${admin.email} ${action === "activate" ? "mengaktifkan" : "menonaktifkan"} manajer ${manager.email}.`,
      },
    });
  } else {
    return NextResponse.json({ error: "Aksi tidak valid." }, { status: 400 });
  }

  const responseUrl = new URL(`/dashboard/admin/managers/${userId}`, getBaseUrl(request));
  responseUrl.searchParams.set("toast", `Akun Manajer berhasil ${action === "activate" ? "diaktifkan" : "dinonaktifkan"}.`);
  return NextResponse.redirect(responseUrl);
}
