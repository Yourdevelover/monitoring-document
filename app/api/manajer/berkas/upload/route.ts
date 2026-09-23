import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enqueueFileTask } from "@/lib/upload-queue";

const VALID_CATEGORIES = new Set(["DAILY", "CHAT", "PAYMENT"]);

export async function POST(request: Request) {
  try {
    const manager = await requireManager();
    const team = await prisma.team.findUnique({
      where: { managerId: manager.id },
    });

    if (!team) {
      return NextResponse.json(
        { success: false, error: "Tim tidak ditemukan." },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const action = String(formData.get("action") ?? "upload");

    if (action === "delete") {
      const uploadId = Number(formData.get("uploadId") ?? 0);

      if (!uploadId) {
        return NextResponse.json(
          { success: false, error: "ID berkas tidak valid." },
          { status: 400 }
        );
      }

      return await enqueueFileTask(async () => {
        const upload = await prisma.upload.findFirst({
          where: {
            id: uploadId,
            userId: manager.id,
            teamId: team.id,
          },
        });

        if (!upload) {
          return NextResponse.json(
            { success: false, error: "Berkas tidak ditemukan atau bukan milik Anda." },
            { status: 404 }
          );
        }

        const filePathOnDisk = path.join(
          process.cwd(),
          "public",
          upload.filePath.replace(/^\/+/, "")
        );

        try {
          await unlink(filePathOnDisk);
        } catch {
          // Ignore missing file on disk; the database record should still be deleted.
        }

        await prisma.$transaction([
          prisma.uploadHistory.deleteMany({ where: { sourceUploadId: upload.id } }),
          prisma.importantFile.deleteMany({ where: { sourceUploadId: upload.id } }),
          prisma.upload.delete({ where: { id: upload.id } }),
        ]);

        await prisma.activityLog.create({
          data: {
            actorId: manager.id,
            action: "DELETE_FILE",
            targetType: "UPLOAD",
            targetId: upload.id,
            description: `${manager.name} menghapus berkas ${upload.fileName} (${upload.category}).`,
          },
        });

        return NextResponse.json({
          success: true,
          message: "Berkas berhasil dihapus",
        });
      });
    }

    const category = String(formData.get("category") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    const file = formData.get("file");

    if (!VALID_CATEGORIES.has(category) || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { success: false, error: "Kategori dan file wajib diisi." },
        { status: 400 }
      );
    }

    return await enqueueFileTask(async () => {
      const originalFileName = file.name || `upload-${Date.now()}`;
      const safeFileName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, "_");

      const storageFolder = path.join(
        process.cwd(),
        "public",
        "uploads",
        "teams",
        String(team.id),
        "managers",
        String(manager.id)
      );
      await mkdir(storageFolder, { recursive: true });

      const uniqueFileName = `${Date.now()}-${safeFileName}`;
      const filePathOnDisk = path.join(storageFolder, uniqueFileName);
      const publicFilePath = `/uploads/teams/${team.id}/managers/${manager.id}/${uniqueFileName}`;

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePathOnDisk, buffer);

      const upload = await prisma.upload.create({
        data: {
          userId: manager.id,
          teamId: team.id,
          title: title || safeFileName,
          fileName: safeFileName,
          filePath: publicFilePath,
          fileType: file.type || "application/octet-stream",
          category: category as "DAILY" | "CHAT" | "PAYMENT",
          status: "COMPLETED",
          isSubmitted: true,
          submissionDate: new Date(),
        },
      });

      await prisma.activityLog.create({
        data: {
          actorId: manager.id,
          action: "UPLOAD_FILE",
          targetType: "UPLOAD",
          targetId: upload.id,
          description: `${manager.name} membagikan berkas ${upload.fileName} (${upload.category}) ke tim.`,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Berkas berhasil dibagikan ke tim",
        id: upload.id,
      });
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "Terjadi kesalahan server saat mengunggah berkas.",
      },
      { status: 500 }
    );
  }
}