import { unlink } from "node:fs/promises";
import path from "node:path";
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
  const leader = await prisma.user.findFirst({ where: { id: userId, role: "LEADER" }, include: { ledTeam: true } });
  if (!leader) return NextResponse.json({ error: "Leader tidak ditemukan." }, { status: 404 });

  if (action === "approve" || action === "reject") {
    if (leader.isActive !== "PENDING") {
      return NextResponse.redirect(new URL("/dashboard/admin/leaders", getBaseUrl(request)));
    }

    const approved = action === "approve";
    await prisma.$transaction(async (transaction) => {
      const updated = await transaction.user.updateMany({
        where: { id: userId, role: "LEADER", isActive: "PENDING" },
        data: { isActive: approved ? "ACTIVE" : "REJECTED" },
      });
      if (updated.count === 0) return;

      await transaction.team.updateMany({
        where: { leaderId: userId },
        data: { isActive: approved },
      });
      await transaction.activityLog.create({
        data: {
          actorId: admin.id,
          action: approved ? "APPROVE_LEADER" : "REJECT_LEADER",
          targetType: "USER",
          targetId: userId,
          description: `Admin ${admin.email} ${approved ? "menyetujui" : "menolak"} pendaftaran leader ${leader.email}.`,
        },
      });
    });
  } else if (action === "deactivate") {
    await prisma.user.update({ where: { id: userId }, data: { isActive: "INACTIVE" } });
  } else if (action === "activate") {
    await prisma.user.update({ where: { id: userId }, data: { isActive: "ACTIVE" } });
  } else if (action === "delete") {
    if (leader.ledTeam) {
      const employeeCount = await prisma.user.count({
        where: { teamId: leader.ledTeam.id, role: "KARYAWAN" },
      });
      if (employeeCount > 0) {
        const blockedUrl = new URL(`/dashboard/admin/leaders/${leader.id}`, getBaseUrl(request));
        blockedUrl.searchParams.set("toast", `Leader belum dapat dihapus. Hapus atau pindahkan ${employeeCount} karyawan dari timnya terlebih dahulu.`);
        blockedUrl.searchParams.set("toastType", "error");
        return NextResponse.redirect(blockedUrl);
      }

      const remainingMembers = await prisma.user.count({ where: { teamId: leader.ledTeam.id } });
      if (remainingMembers > 0) {
        const blockedUrl = new URL(`/dashboard/admin/leaders/${leader.id}`, getBaseUrl(request));
        blockedUrl.searchParams.set("toast", "Tim masih memiliki anggota. Pindahkan atau hapus semua anggota sebelum menghapus Leader.");
        blockedUrl.searchParams.set("toastType", "error");
        return NextResponse.redirect(blockedUrl);
      }

      const [uploads, histories, importantFiles] = await Promise.all([
        prisma.upload.findMany({ where: { teamId: leader.ledTeam.id }, select: { filePath: true } }),
        prisma.uploadHistory.findMany({ where: { teamId: leader.ledTeam.id }, select: { filePath: true } }),
        prisma.importantFile.findMany({ where: { teamId: leader.ledTeam.id }, select: { filePath: true } }),
      ]);
      const filePaths = [...new Set([...uploads, ...histories, ...importantFiles].map((file) => file.filePath))];

      await prisma.$transaction(async (transaction) => {
        await transaction.message.deleteMany({
          where: { OR: [{ senderId: leader.id }, { recipientId: leader.id }] },
        });
        await transaction.profileRequest.deleteMany({
          where: { OR: [{ userId: leader.id }, { reviewerId: leader.id }] },
        });
        await transaction.announcement.deleteMany({
          where: { OR: [{ leaderId: leader.id }, { teamId: leader.ledTeam!.id }] },
        });
        await transaction.importantFile.deleteMany({ where: { teamId: leader.ledTeam!.id } });
        await transaction.uploadHistory.deleteMany({ where: { teamId: leader.ledTeam!.id } });
        await transaction.upload.deleteMany({ where: { teamId: leader.ledTeam!.id } });
        await transaction.team.delete({ where: { id: leader.ledTeam!.id } });
        await transaction.activityLog.deleteMany({ where: { actorId: leader.id } });
        await transaction.user.delete({ where: { id: leader.id } });
        await transaction.activityLog.create({
          data: {
            actorId: admin.id,
            action: "DELETE_LEADER",
            targetType: "USER",
            targetId: leader.id,
            description: `Admin ${admin.email} menghapus Leader ${leader.email} setelah tim tidak memiliki anggota.`,
          },
        });
      });

      const uploadsRoot = path.resolve(process.cwd(), "public", "uploads");
      await Promise.all(filePaths.map(async (filePath) => {
        const relativeFilePath = filePath.replace(/^\/+/, "");
        const diskPath = path.resolve(process.cwd(), "public", relativeFilePath);
        if (!diskPath.startsWith(`${uploadsRoot}${path.sep}`)) return;
        try {
          await unlink(diskPath);
        } catch (error) {
          if (error instanceof Error && "code" in error && error.code !== "ENOENT") {
            console.error("Failed to remove leader team file:", error);
          }
        }
      }));

      const deletedUrl = new URL("/dashboard/admin/leaders", getBaseUrl(request));
      deletedUrl.searchParams.set("toast", `Leader ${leader.name} berhasil dihapus karena timnya sudah kosong.`);
      return NextResponse.redirect(deletedUrl);
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.message.deleteMany({
        where: { OR: [{ senderId: leader.id }, { recipientId: leader.id }] },
      });
      await transaction.profileRequest.deleteMany({
        where: { OR: [{ userId: leader.id }, { reviewerId: leader.id }] },
      });
      await transaction.activityLog.deleteMany({ where: { actorId: leader.id } });
      await transaction.user.delete({ where: { id: leader.id } });
      await transaction.activityLog.create({
        data: {
          actorId: admin.id,
          action: "DELETE_LEADER",
          targetType: "USER",
          targetId: leader.id,
          description: `Admin ${admin.email} menghapus Leader ${leader.email} yang tidak memiliki tim.`,
        },
      });
    });
  } else {
    return NextResponse.json({ error: "Aksi tidak valid." }, { status: 400 });
  }

  const responseUrl = new URL("/dashboard/admin/leaders", getBaseUrl(request));
  if (action === "deactivate" || action === "activate") {
    responseUrl.searchParams.set("toast", `Akun Leader berhasil ${action === "activate" ? "diaktifkan" : "dinonaktifkan"}.`);
  }
  return NextResponse.redirect(responseUrl);
}
