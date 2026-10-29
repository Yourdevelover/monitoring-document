import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enqueueFileTask } from "@/lib/upload-queue";
import { exceedsUploadRequestLimit, MAX_UPLOAD_SIZE_BYTES } from "@/lib/upload-limits";
import { copyStoredFile, createSignedUpload, deleteStoredFile, verifyStoredFile } from "@/lib/storage";

const VALID_CATEGORIES = new Set(["DAILY", "CHAT", "PAYMENT"]);

export async function POST(request: Request) {
  try {
    const employee = await getSessionUser();
    if (!employee || employee.role !== "KARYAWAN") {
      return NextResponse.json({ success: false, error: "Sesi berakhir. Login ulang." }, { status: 401 });
    }

    if (exceedsUploadRequestLimit(request)) {
      return NextResponse.json({ success: false, error: "Ukuran permintaan melebihi batas unggah." }, { status: 413 });
    }

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

        try {
          await deleteStoredFile(upload.filePath);
        } catch {
          // Keep the database cleanup working if the stored object is already missing.
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
      }, `employee:${employee.id}`);
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

        try {
          await deleteStoredFile(importantFile.filePath);
        } catch {
          // The permanent copy may already be missing from storage.
        }

        await prisma.$transaction([
          prisma.uploadHistory.deleteMany({
            where: { sourceUploadId: importantFile.sourceUploadId },
          }),
          prisma.importantFile.delete({ where: { id: importantFile.id } }),
          prisma.upload.deleteMany({ where: { id: importantFile.sourceUploadId } }),
        ]);

        return NextResponse.json({ success: true, message: "Data penting berhasil dihapus." });
      }, `employee:${employee.id}`);
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
      }, `employee:${employee.id}`);
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

        const importantFileName = `${Date.now()}-${upload.fileName}`;
        const importantPublicPath = `/uploads/teams/${upload.teamId}/employees/${employee.id}/important/${importantFileName}`;
        await copyStoredFile(upload.filePath, importantPublicPath);

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
      }, `employee:${employee.id}`);
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

        try {
          await deleteStoredFile(upload.filePath);
        } catch {
          // Ignore missing objects; metadata still needs to be removed.
        }

        await prisma.upload.delete({
          where: { id: uploadId },
        });

        return NextResponse.json({
          success: true,
          message: "Berkas berhasil dihapus",
        });
      }, `employee:${employee.id}`);
    }

    const category = String(formData.get("category") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    if (action === "prepare-upload") {
      const fileName = String(formData.get("fileName") ?? "").replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileSize = Number(formData.get("fileSize") ?? 0);
      if (!VALID_CATEGORIES.has(category) || !fileName || !Number.isSafeInteger(fileSize) || fileSize <= 0) {
        return NextResponse.json({ success: false, error: "Kategori dan detail file wajib diisi." }, { status: 400 });
      }
      if (fileSize > MAX_UPLOAD_SIZE_BYTES) {
        return NextResponse.json({ success: false, error: "Ukuran berkas maksimal 50 MiB." }, { status: 413 });
      }

      return await enqueueFileTask(async () => {
        const activeUpload = await prisma.upload.findFirst({
          where: { userId: employee.id, category: category as "DAILY" | "CHAT" | "PAYMENT", isImportant: false, isSubmitted: false },
        });
        if (activeUpload) {
          return NextResponse.json({ success: false, error: "Kategori ini masih memiliki berkas aktif." }, { status: 409 });
        }

        const objectPath = `uploads/teams/${teamId}/employees/${employee.id}/${randomUUID()}-${fileName}`;
        const upload = await createSignedUpload(objectPath);
        return NextResponse.json({ success: true, ...upload, fileName, fileSize, fileType: String(formData.get("fileType") ?? "application/octet-stream"), title });
      }, `employee:${employee.id}`);
    }

    if (action === "complete-upload") {
      const filePath = String(formData.get("filePath") ?? "");
      const fileName = String(formData.get("fileName") ?? "").replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileSize = Number(formData.get("fileSize") ?? 0);
      const fileType = String(formData.get("fileType") ?? "application/octet-stream");
      const expectedPrefix = `uploads/teams/${teamId}/employees/${employee.id}/`;
      if (!VALID_CATEGORIES.has(category) || !filePath.startsWith(expectedPrefix) || !fileName || !Number.isSafeInteger(fileSize) || fileSize <= 0 || fileSize > MAX_UPLOAD_SIZE_BYTES) {
        return NextResponse.json({ success: false, error: "Data file tidak valid." }, { status: 400 });
      }

      return await enqueueFileTask(async () => {
        const activeUpload = await prisma.upload.findFirst({
          where: { userId: employee.id, category: category as "DAILY" | "CHAT" | "PAYMENT", isImportant: false, isSubmitted: false },
        });
        if (activeUpload) {
          await deleteStoredFile(filePath).catch(() => undefined);
          return NextResponse.json({ success: false, error: "Kategori ini masih memiliki berkas aktif." }, { status: 409 });
        }

        await verifyStoredFile(filePath, fileSize);
        const publicFilePath = `/${filePath}`;
        try {
          const upload = await prisma.upload.create({
            data: {
              userId: employee.id,
              teamId,
              title: title || fileName,
              fileName,
              filePath: publicFilePath,
              fileType,
              category: category as "DAILY" | "CHAT" | "PAYMENT",
              status: "COMPLETED",
            },
          });
          await prisma.activityLog.create({
            data: { actorId: employee.id, action: "UPLOAD_FILE", targetType: "UPLOAD", targetId: upload.id, description: `${employee.name} mengunggah berkas ${upload.fileName} (${upload.category}).` },
          });
          return NextResponse.json({ success: true, message: "Berkas berhasil diunggah", id: upload.id, redirect: "/dashboard/karyawan/berkas" });
        } catch (error) {
          await deleteStoredFile(filePath).catch(() => undefined);
          throw error;
        }
      }, `employee:${employee.id}`);
    }

    return NextResponse.json({ success: false, error: "Tahap upload file tidak valid." }, { status: 400 });
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
