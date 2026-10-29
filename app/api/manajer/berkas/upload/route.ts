import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enqueueFileTask } from "@/lib/upload-queue";
import { exceedsUploadRequestLimit, MAX_UPLOAD_SIZE_BYTES } from "@/lib/upload-limits";
import { createSignedUpload, deleteStoredFile, verifyStoredFile } from "@/lib/storage";

const VALID_CATEGORIES = new Set(["DAILY", "CHAT", "PAYMENT"]);

export async function POST(request: Request) {
  try {
    const manager = await requireManager();
    if (exceedsUploadRequestLimit(request)) {
      return NextResponse.json({ success: false, error: "Ukuran permintaan melebihi batas unggah." }, { status: 413 });
    }

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

        try {
          await deleteStoredFile(upload.filePath);
        } catch {
          // Keep the database cleanup working if the stored object is already missing.
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
      }, `manager:${manager.id}`);
    }

    const category = String(formData.get("category") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    const fileName = String(formData.get("fileName") ?? "").replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileSize = Number(formData.get("fileSize") ?? 0);
    const fileType = String(formData.get("fileType") ?? "application/octet-stream");

    if (!VALID_CATEGORIES.has(category)) {
      return NextResponse.json(
        { success: false, error: "Kategori tidak valid." },
        { status: 400 }
      );
    }

    if (action === "prepare-upload") {
      if (!fileName || !Number.isSafeInteger(fileSize) || fileSize <= 0) {
        return NextResponse.json({ success: false, error: "Detail file wajib diisi." }, { status: 400 });
      }
      if (fileSize > MAX_UPLOAD_SIZE_BYTES) {
        return NextResponse.json({ success: false, error: "Ukuran berkas maksimal 50 MiB." }, { status: 413 });
      }

      const objectPath = `uploads/teams/${team.id}/managers/${manager.id}/${randomUUID()}-${fileName}`;
      const upload = await createSignedUpload(objectPath);
      return NextResponse.json({ success: true, ...upload, fileName, fileSize, fileType, title });
    }

    if (action === "complete-upload") {
      const filePath = String(formData.get("filePath") ?? "");
      const expectedPrefix = `uploads/teams/${team.id}/managers/${manager.id}/`;
      if (!filePath.startsWith(expectedPrefix) || !fileName || !Number.isSafeInteger(fileSize) || fileSize <= 0 || fileSize > MAX_UPLOAD_SIZE_BYTES) {
        return NextResponse.json({ success: false, error: "Data file tidak valid." }, { status: 400 });
      }

      await verifyStoredFile(filePath, fileSize);
      const publicFilePath = `/${filePath}`;
      try {
        const upload = await prisma.upload.create({
          data: {
            userId: manager.id,
            teamId: team.id,
            title: title || fileName,
            fileName,
            filePath: publicFilePath,
            fileType,
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

        return NextResponse.json({ success: true, message: "Berkas berhasil dibagikan ke tim", id: upload.id });
      } catch (error) {
        await deleteStoredFile(filePath).catch(() => undefined);
        throw error;
      }
    }

    if (action !== "upload") {
      return NextResponse.json({ success: false, error: "Aksi upload tidak valid." }, { status: 400 });
    }

    if (fileSize > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json({ success: false, error: "Ukuran berkas maksimal 50 MiB." }, { status: 413 });
    }
    return NextResponse.json({ success: false, error: "Tahap upload file tidak valid." }, { status: 400 });
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