import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/redirect";

function redirectWithToast(request: Request, leaderId: number, message: string, type: "success" | "error" = "success") {
  const url = new URL(`/dashboard/admin/leaders/${leaderId}/members`, getBaseUrl(request));
  url.searchParams.set("toast", message);
  if (type !== "success") url.searchParams.set("toastType", type);
  return NextResponse.redirect(url);
}

export async function POST(request: Request) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });

  const formData = await request.formData();
  const leaderId = Number(formData.get("leaderId"));
  const employeeId = Number(formData.get("employeeId"));
  const action = String(formData.get("action") ?? "");
  if (!Number.isInteger(leaderId) || leaderId <= 0 || !Number.isInteger(employeeId) || employeeId <= 0) {
    return NextResponse.json({ error: "Leader atau karyawan tidak valid." }, { status: 400 });
  }

  const sourceTeam = await prisma.team.findUnique({ where: { leaderId } });
  if (!sourceTeam) return NextResponse.json({ error: "Tim Leader tidak ditemukan." }, { status: 404 });
  const employee = await prisma.user.findFirst({ where: { id: employeeId, teamId: sourceTeam.id, role: "KARYAWAN" } });
  if (!employee) return NextResponse.json({ error: "Karyawan tidak ditemukan di tim Leader ini." }, { status: 404 });

  if (action === "deactivate" || action === "activate") {
    const nextStatus = action === "activate" ? "ACTIVE" : "INACTIVE";
    await prisma.$transaction([
      prisma.user.update({ where: { id: employee.id }, data: { isActive: nextStatus } }),
      prisma.activityLog.create({
        data: {
          actorId: admin.id,
          action: action === "activate" ? "ACTIVATE_EMPLOYEE" : "DEACTIVATE_EMPLOYEE",
          targetType: "USER",
          targetId: employee.id,
          description: `Admin ${admin.email} ${action === "activate" ? "mengaktifkan" : "menonaktifkan"} karyawan ${employee.email} dari pengelolaan tim ${sourceTeam.name}.`,
        },
      }),
    ]);
    return redirectWithToast(request, leaderId, `Akun ${employee.name} berhasil ${action === "activate" ? "diaktifkan" : "dinonaktifkan"}.`);
  }

  if (action === "move") {
    const targetLeaderId = Number(formData.get("targetLeaderId"));
    if (!Number.isInteger(targetLeaderId) || targetLeaderId <= 0 || targetLeaderId === leaderId) {
      return NextResponse.json({ error: "Leader tujuan tidak valid." }, { status: 400 });
    }
    const targetTeam = await prisma.team.findFirst({
      where: {
        leaderId: targetLeaderId,
        isActive: true,
        leader: { role: "LEADER", isActive: "ACTIVE" },
        department: { isActive: true },
      },
      include: { leader: true },
    });
    if (!targetTeam) return redirectWithToast(request, leaderId, "Leader tujuan tidak memiliki tim dan departemen aktif.", "error");

    await prisma.$transaction([
      prisma.user.update({ where: { id: employee.id }, data: { teamId: targetTeam.id, departmentId: targetTeam.departmentId } }),
      prisma.activityLog.create({
        data: {
          actorId: admin.id,
          action: "MOVE_EMPLOYEE",
          targetType: "USER",
          targetId: employee.id,
          description: `Admin ${admin.email} memindahkan karyawan ${employee.email} dari tim ${sourceTeam.name} ke tim ${targetTeam.name} (${targetTeam.leader.name}).`,
        },
      }),
    ]);
    return redirectWithToast(request, leaderId, `${employee.name} dipindahkan ke tim ${targetTeam.name}.`);
  }

  return NextResponse.json({ error: "Aksi tidak valid." }, { status: 400 });
}
