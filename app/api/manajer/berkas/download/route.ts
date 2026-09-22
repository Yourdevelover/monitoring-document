import { ZipArchive } from "archiver";
import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStartOfCurrentJakartaDay } from "@/lib/upload-time";

export const runtime = "nodejs";

const VALID_CATEGORIES = new Set(["DATA_A", "DATA_B", "DATA_C"]);

type DownloadRecord = {
  filePath: string;
  fileName: string;
  archiveDate: Date;
  user: { name: string };
};

function getDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export async function GET(request: Request) {
  const manager = await requireManager();
  const searchParams = new URL(request.url).searchParams;
  const category = searchParams.get("category") ?? "";
  const historyOnly = searchParams.get("history") === "true";
  const date = searchParams.get("date");

  if (!VALID_CATEGORIES.has(category)) {
    return NextResponse.json({ error: "Kategori tidak valid." }, { status: 400 });
  }

  const team = await prisma.team.findUnique({ where: { managerId: manager.id } });
  if (!team) {
    return NextResponse.json({ error: "Tim tidak ditemukan." }, { status: 404 });
  }

  const uploadRecords: DownloadRecord[] = historyOnly
    ? (await prisma.uploadHistory.findMany({
        where: { teamId: team.id, category: category as "DATA_A" | "DATA_B" | "DATA_C" },
        include: { user: true },
        orderBy: { submittedAt: "asc" },
      })).map((upload) => ({
        filePath: upload.filePath,
        fileName: upload.fileName,
        archiveDate: upload.submittedAt,
        user: upload.user,
      }))
    : (await prisma.upload.findMany({
        where: {
          teamId: team.id,
          category: category as "DATA_A" | "DATA_B" | "DATA_C",
          isSubmitted: true,
          isImportant: false,
          submissionDate: { gte: getStartOfCurrentJakartaDay() },
        },
        include: { user: true },
        orderBy: { createdAt: "asc" },
      })).map((upload) => ({
        filePath: upload.filePath,
        fileName: upload.fileName,
        archiveDate: upload.submissionDate,
        user: upload.user,
      }))
  const dateFilteredUploads = date && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? uploadRecords.filter((upload) => getDateKey(upload.archiveDate) === date)
    : uploadRecords;

  if (dateFilteredUploads.length === 0) {
    return NextResponse.json({ error: "Belum ada file aktif untuk diunduh." }, { status: 404 });
  }

  const archive = new ZipArchive({ zlib: { level: 9 } });
  const chunks: Buffer[] = [];
  const archiveFinished = new Promise<void>((resolve, reject) => {
    archive.on("data", (chunk: Buffer) => chunks.push(chunk));
    archive.on("end", () => resolve());
    archive.on("error", reject);
  });

  for (const upload of dateFilteredUploads) {
    try {
      const filePath = path.join(process.cwd(), "public", upload.filePath.replace(/^\/+/, ""));
      const fileBuffer = await readFile(filePath);
      archive.append(fileBuffer, {
        name: `${upload.user.name}-${upload.fileName}`.replace(/[^a-zA-Z0-9._-]/g, "_"),
      });
    } catch {
      // Skip files that are no longer present on disk.
    }
  }

  archive.finalize();
  await archiveFinished;

  return new NextResponse(Buffer.concat(chunks), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${category.toLowerCase()}-tim.zip"`,
    },
  });
}
