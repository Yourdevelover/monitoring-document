import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUploadFileName } from "@/lib/upload-file";
import { enqueueFileTask } from "@/lib/upload-queue";
import { exceedsUploadRequestLimit, MAX_UPLOAD_SIZE_BYTES } from "@/lib/upload-limits";

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
          prisma.upload.delete({ where: { id: uploadIdToDelete } }),
        ]);

        return NextResponse.json({
          success: true,
          message: "Berkas berhasil dihapus",
        });
      });
    }

    if (action === "unmark-important") {
      const uploadId = Number(formData.get("uploadId") ?? 0);
      if (!uploadId) {
        return NextResponse.json({ success: false, error: "ID berkas tidak valid." }, { status: 400 });
      }

      const upload = await prisma.upload.findFirst({
        where: { id: uploadId, userId: employee.id, isImportant: true },
        select: { id: true },
      });
      if (!upload) {
        return NextResponse.json({ success: false, error: "Data penting tidak ditemukan." }, { status: 404 });
      }

      await prisma.upload.update({ where: { id: upload.id }, data: { isImportant: false } });
      return NextResponse.json({ success: true, message: "Berkas dihapus dari Data Prioritas." });
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

        const submittedAt = new Date();
        await prisma.upload.update({
          where: { id: uploadId },
          data: { submissionDate: submittedAt },
        });

        await prisma.activityLog.create({
          data: {
            actorId: employee.id,
            action: "SUBMIT_FILE",
            targetType: "UPLOAD",
            targetId: upload.id,
            description: `${employee.name} mengirim berkas ${getUploadFileName(upload.filePath)} (${upload.category}).`,
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

        if (upload.isImportant) {
          return NextResponse.json({
            success: true,
            message: "Berkas sudah tersimpan di Data Prioritas",
          });
        }
        await prisma.upload.update({
          where: { id: upload.id },
          data: { isImportant: true },
        });

        return NextResponse.json({
          success: true,
          message: "Berkas berhasil disimpan ke Data Prioritas",
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
    const isImportant = formData.get("isImportant") === "true";
    const note = String(formData.get("note") ?? "").trim();
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

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json({ success: false, error: "Ukuran berkas maksimal 50 MiB." }, { status: 413 });
    }

    if (note.length > 1000) {
      return NextResponse.json({ success: false, error: "Catatan maksimal 1.000 karakter." }, { status: 400 });
    }

    return await enqueueFileTask(async () => {
      const activeUpload = await prisma.upload.findFirst({
        where: {
          userId: employee.id,
          category: category as "DAILY" | "CHAT" | "PAYMENT",
          submissionDate: null,
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
          filePath: publicFilePath,
          submissionDate: null,
          category: category as "DAILY" | "CHAT" | "PAYMENT",
          status: "COMPLETED",
          isImportant,
          note: note || null,
        },
      });

      await prisma.activityLog.create({
        data: {
          actorId: employee.id,
          action: "UPLOAD_FILE",
          targetType: "UPLOAD",
          targetId: upload.id,
          description: `${employee.name} mengunggah berkas ${safeFileName} (${upload.category}).`,
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
