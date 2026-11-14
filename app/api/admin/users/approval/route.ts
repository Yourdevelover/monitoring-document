import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/redirect";

const ROLE_LABELS = {
  LEADER: "Leader",
  KARYAWAN: "Karyawan",
  MANAJER: "Manajer",
} as const;

type ApproveableRole = keyof typeof ROLE_LABELS;

export async function POST(request: Request) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const formData = await request.formData();
  const userId = Number(formData.get("userId"));
  const role = String(formData.get("role") ?? "") as ApproveableRole;
  const decision = String(formData.get("decision") ?? "");

  if (!Number.isInteger(userId) || userId <= 0 || !(role in ROLE_LABELS) || !["approve", "reject"].includes(decision)) {
    return NextResponse.json({ error: "Data persetujuan tidak valid." }, { status: 400 });
  }

  const approved = decision === "approve";
  const updated = await prisma.$transaction(async (transaction) => {
    const result = await transaction.user.updateMany({
      where: { id: userId, role, isActive: approved ? { in: ["PENDING", "REJECTED"] } : "PENDING" },
      data: { isActive: approved ? "ACTIVE" : "REJECTED" },
    });
    if (result.count === 0) return false;

    if (role === "LEADER") {
      await transaction.team.updateMany({
        where: { leaderId: userId },
        data: { isActive: approved },
      });
    }

    await transaction.activityLog.create({
      data: {
        actorId: admin.id,
        action: `${approved ? "APPROVE" : "REJECT"}_${role}`,
        targetType: "USER",
        targetId: userId,
        description: `Admin ${admin.email} ${approved ? "menyetujui" : "menolak"} pendaftaran ${ROLE_LABELS[role]}.`,
      },
    });

    return true;
  });

  const roleKey = role === "LEADER" ? "leaders" : role === "KARYAWAN" ? "karyawan" : "managers";
  const responseUrl = new URL(`/dashboard/admin/approvals?role=${roleKey}`, getBaseUrl(request));
  if (updated) responseUrl.searchParams.set("result", approved ? "approved" : "rejected");
  return NextResponse.redirect(responseUrl);
}