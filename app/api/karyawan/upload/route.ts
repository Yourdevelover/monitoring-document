import { copyFile, mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireEmployee } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enqueueFileTask } from "@/lib/upload-queue";
import { getStartOfCurrentJakartaDay } from "@/lib/upload-time";

const VALID_CATEGORIES = new Set(["DATA_A", "DATA_B", "DATA_C"]);

export async function POST(request: Request) {
  try {
    const employee = await requireEmployee();

    const teamId = employee.teamId;

    if (!teamId) {
      return NextResponse.json(
        {
          success: false,
          error: "Akun karyawan belum terhubung ke tim.",
        },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const action = String(formData.get("action") ?? "upload");
    const startOfToday = getStartOfCurrentJakartaDay();

    if (action === "delete") {
      const uploadId = Number(formData.get("uploadId") ?? 0);

      if (!uploadId) {
        return NextResponse.json(
          {
            success: false,
            error: "ID berkas tidak valid.",
          },
          { status: 400 }
        );
      }

      return await enqueueFileTask(async () => {
        const upload = await prisma.upload.findFirst({
          where: {
            id: uploadId,
            userId: employee.id,
          },
        });

        if (!upload) {
          return NextResponse.json(
            {
              success: false,
              error: "Berkas tidak ditemukan atau bukan milik Anda.",
            },
            { status: 404 }
          );
        }

        const uploadIdToDelete = upload.id;

        if (uploadIdToDelete == null) {
          return NextResponse.json(
            {
              success: false,
              error: "Berkas tidak dapat dihapus karena data tidak valid.",
            },
            { status: 400 }
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
          prisma.uploadHistory.deleteMany({ where: { sourceUploadId: uploadIdToDelete } }),
          prisma.importantFile.deleteMany({ where: { sourceUploadId: uploadIdToDelete } }),
          prisma.upload.delete({ where: { id: uploadIdToDelete } }),
        ]);

        return NextResponse.json({
          success: true,
          message: "Berkas berhasil dihapus",
        });
      });
    }

    if (action === "delete-important") {
      return await enqueueFileTask(async () => {
        const uploadId = Number(formData.get("uploadId") ?? 0);
        const importantFile = await prisma.importantFile.findFirst({
          where: { id: uploadId, userId: employee.id },
        });

        if (!importantFile) {
          return NextResponse.json({ success: false, error: "Data penting tidak ditemukan." }, { status: 404 });
        }

        const importantPath = path.join(process.cwd(), "public", importantFile.filePath.replace(/^\/+/, ""));
        try {
          await unlink(importantPath);
        } catch {
          // The permanent copy may already be missing from disk.
        }

        await prisma.$transaction([
          prisma.uploadHistory.deleteMany({
            where: { sourceUploadId: importantFile.sourceUploadId },
          }),
          prisma.importantFile.delete({ where: { id: importantFile.id } }),
          prisma.upload.deleteMany({ where: { id: importantFile.sourceUploadId } }),
        ]);

        return NextResponse.json({ success: true, message: "Data penting berhasil dihapus." });
      });
    }

    if (action === "submit") {
      const uploadId = Number(formData.get("uploadId") ?? 0);

      if (!uploadId) {
        return NextResponse.json(
          {
            success: false,
            error: "ID berkas tidak valid.",
          },
          { status: 400 }
        );
      }

      return await enqueueFileTask(async () => {
        const upload = await prisma.upload.findFirst({
          where: {
            id: uploadId,
            userId: employee.id,
          },
        });

        if (!upload) {
          return NextResponse.json(
            {
              success: false,
              error: "Berkas tidak ditemukan atau bukan milik Anda.",
            },
            { status: 404 }
          );
        }

        // Set expiration time to 12 hours from now
        const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);

        const submittedAt = new Date();
        await prisma.$transaction([
          prisma.upload.update({
            where: { id: uploadId },
            data: { isSubmitted: true, submissionDate: submittedAt, expiresAt },
          }),
          prisma.uploadHistory.upsert({
            where: { sourceUploadId: uploadId },
            update: { submittedAt, filePath: upload.filePath },
            create: {
              sourceUploadId: upload.id,
              userId: upload.userId,
              teamId: upload.teamId,
              title: upload.title,
              fileName: upload.fileName,
              filePath: upload.filePath,
              fileType: upload.fileType,
              category: upload.category,
              status: upload.status,
              submittedAt,
            },
          }),
        ]);

        await prisma.activityLog.create({
          data: {
            actorId: employee.id,
            action: "SUBMIT_FILE",
            targetType: "UPLOAD",
            targetId: upload.id,
            description: `${employee.name} mengirim berkas ${upload.fileName} (${upload.category}).`,
          },
        });

        return NextResponse.json({
          success: true,
          message: "Berkas berhasil dikirim",
        });
      });
    }

    if (action === "add-important") {
      const uploadId = Number(formData.get("uploadId") ?? 0);

      if (!uploadId) {
        return NextResponse.json(
          {
            success: false,
            error: "ID berkas tidak valid.",
          },
          { status: 400 }
        );
      }

      return await enqueueFileTask(async () => {
        const upload = await prisma.upload.findFirst({
          where: {
            id: uploadId,
            userId: employee.id,
          },
        });

        if (!upload) {
          return NextResponse.json(
            {
              success: false,
              error: "Berkas tidak ditemukan atau bukan milik Anda.",
            },
            { status: 404 }
          );
        }

        const existingImportant = await prisma.importantFile.findUnique({
          where: { sourceUploadId: upload.id },
        });

        if (existingImportant) {
          return NextResponse.json({
            success: true,
            message: "Berkas sudah tersimpan di Data Penting",
          });
        }

        const sourcePath = path.join(
          process.cwd(),
          "public",
          upload.filePath.replace(/^\/+/, "")
        );
        const importantFolder = path.join(
          process.cwd(),
          "public",
          "uploads",
          "teams",
          String(upload.teamId),
          "employees",
          String(employee.id),
          "important"
        );
        await mkdir(importantFolder, { recursive: true });

        const importantFileName = `${Date.now()}-${upload.fileName}`;
        const importantPath = path.join(importantFolder, importantFileName);
        const importantPublicPath = `/uploads/teams/${upload.teamId}/employees/${employee.id}/important/${importantFileName}`;

        await copyFile(sourcePath, importantPath);

        await prisma.$transaction([
          prisma.importantFile.create({
            data: {
              sourceUploadId: upload.id,
              userId: employee.id,
              teamId: upload.teamId,
              title: upload.title,
              fileName: upload.fileName,
              filePath: importantPublicPath,
              fileType: upload.fileType,
              category: upload.category,
              status: upload.status,
              savedAt: new Date(),
            },
          }),
          prisma.upload.update({ where: { id: upload.id }, data: { importantSaved: true } }),
        ]);

        return NextResponse.json({
          success: true,
          message: "Berkas berhasil disimpan ke Data Penting",
        });
      });
    }

    if (action === "replace") {
      const uploadId = Number(formData.get("uploadId") ?? 0);

      if (!uploadId) {
        return NextResponse.json(
          {
            success: false,
            error: "ID berkas tidak valid.",
          },
          { status: 400 }
        );
      }

      return await enqueueFileTask(async () => {
        const upload = await prisma.upload.findFirst({
          where: {
            id: uploadId,
            userId: employee.id,
          },
        });

        if (!upload) {
          return NextResponse.json(
            {
              success: false,
              error: "Berkas tidak ditemukan atau bukan milik Anda.",
            },
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
          // Ignore missing file on disk
        }

        await prisma.upload.delete({
          where: { id: uploadId },
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
        {
          success: false,
          error: "Kategori dan file wajib diisi.",
        },
        { status: 400 }
      );
    }

    return await enqueueFileTask(async () => {
      const activeUpload = await prisma.upload.findFirst({
        where: {
          userId: employee.id,
          category: category as "DATA_A" | "DATA_B" | "DATA_C",
          isImportant: false,
          isSubmitted: false,
        },
      });

      if (activeUpload) {
        return NextResponse.json(
          {
            success: false,
            error: "Kategori ini masih memiliki berkas aktif.",
          },
          { status: 409 }
        );
      }

      const originalFileName = file.name || `upload-${Date.now()}`;
      const safeFileName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, "_");

      const storageFolder = path.join(
        process.cwd(),
        "public",
        "uploads",
        "teams",
        String(teamId),
        "employees",
        String(employee.id)
      );

      await mkdir(storageFolder, { recursive: true });

      const uniqueFileName = `${Date.now()}-${safeFileName}`;
      const filePathOnDisk = path.join(storageFolder, uniqueFileName);
      const publicFilePath = `/uploads/teams/${teamId}/employees/${employee.id}/${uniqueFileName}`;

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePathOnDisk, buffer);

      const upload = await prisma.upload.create({
        data: {
          userId: employee.id,
          teamId,
          title: title || safeFileName,
          fileName: safeFileName,
          filePath: publicFilePath,
          fileType: file.type || "application/octet-stream",
          category: category as "DATA_A" | "DATA_B" | "DATA_C",
          status: "COMPLETED",
        },
      });

      await prisma.activityLog.create({
        data: {
          actorId: employee.id,
          action: "UPLOAD_FILE",
          targetType: "UPLOAD",
          targetId: upload.id,
          description: `${employee.name} mengunggah berkas ${upload.fileName} (${upload.category}).`,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Berkas berhasil diunggah",
        id: upload.id,
        redirect: "/dashboard/karyawan/berkas",
      });
    });
  } catch (error) {
    if (
      error instanceof Error &&
      ((error as unknown as { digest?: string }).digest?.startsWith("NEXT_REDIRECT") ||
        error.message === "NEXT_REDIRECT")
    ) {
      throw error;
    }
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
