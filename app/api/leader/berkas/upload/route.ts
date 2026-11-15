import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireLeader } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUploadFileName } from "@/lib/upload-file";
import { enqueueFileTask } from "@/lib/upload-queue";
import { exceedsUploadRequestLimit, MAX_UPLOAD_SIZE_BYTES } from "@/lib/upload-limits";

const VALID_CATEGORIES = new Set(["DAILY", "CHAT", "PAYMENT", "OTHER"]);

export async function POST(request: Request) {
  try {
    const leader = await requireLeader();
    if (exceedsUploadRequestLimit(request)) {
      return NextResponse.json({ success: false, error: "Ukuran permintaan melebihi batas unggah." }, { status: 413 });
    }

    const team = await prisma.team.findUnique({
      where: { leaderId: leader.id },
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
            userId: leader.id,
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
          prisma.upload.delete({ where: { id: upload.id } }),
        ]);

        await prisma.activityLog.create({
          data: {
            actorId: leader.id,
            action: "DELETE_FILE",
            targetType: "UPLOAD",
            targetId: upload.id,
            description: `${leader.name} menghapus berkas ${getUploadFileName(upload.filePath)} (${upload.category}).`,
          },
        });

        return NextResponse.json({
          success: true,
          message: "Berkas berhasil dihapus",
        });
      });
    }

    const category = String(formData.get("category") ?? "");
    const note = String(formData.get("note") ?? "").trim();
    const file = formData.get("file");

    if (!VALID_CATEGORIES.has(category) || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { success: false, error: "Kategori dan file wajib diisi." },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json({ success: false, error: "Ukuran berkas maksimal 50 MiB." }, { status: 413 });
    }

    if (note.length > 1000) {
      return NextResponse.json({ success: false, error: "Catatan maksimal 1.000 karakter." }, { status: 400 });
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
        "leaders",
        String(leader.id)
      );
      await mkdir(storageFolder, { recursive: true });

      const uniqueFileName = `${Date.now()}-${safeFileName}`;
      const filePathOnDisk = path.join(storageFolder, uniqueFileName);
      const publicFilePath = `/uploads/teams/${team.id}/leaders/${leader.id}/${uniqueFileName}`;

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePathOnDisk, buffer);

      const upload = await prisma.upload.create({
        data: {
          userId: leader.id,
          teamId: team.id,
          filePath: publicFilePath,
          category: category as "DAILY" | "CHAT" | "PAYMENT" | "OTHER",
          status: "COMPLETED",
          submissionDate: new Date(),
          note: note || null,
        },
      });

      await prisma.activityLog.create({
        data: {
          actorId: leader.id,
          action: "UPLOAD_FILE",
          targetType: "UPLOAD",
          targetId: upload.id,
          description: `${leader.name} membagikan berkas ${getUploadFileName(upload.filePath)} (${upload.category}) ke tim.`,
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