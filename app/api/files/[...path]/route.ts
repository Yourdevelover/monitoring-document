import { readFile, stat } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".csv": "text/csv",
  ".txt": "text/plain",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".zip": "application/zip",
};

function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  return MIME_TYPES[ext] ?? "application/octet-stream";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path: pathSegments } = await params;
  if (!pathSegments || pathSegments.length === 0) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Prevent path traversal
  const joinedPath = pathSegments.join("/");
  if (joinedPath.includes("..") || joinedPath.includes("\\")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  // Expected: teams/{teamId}/employees/{id}/file or teams/{teamId}/managers/{id}/file or teams/{teamId}/employees/{id}/important/file
  // Also handle uploads prefix if frontend sends it
  let relativePath = joinedPath;
  if (relativePath.startsWith("uploads/")) {
    relativePath = relativePath.replace(/^uploads\//, "");
  }

  const filePathOnDisk = path.join(process.cwd(), "public", "uploads", relativePath);

  // Ensure resolved path is inside uploads directory
  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  const resolved = path.resolve(filePathOnDisk);
  if (!resolved.startsWith(path.resolve(uploadsRoot))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const fileStat = await stat(resolved);
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Team-based access check
    const teamMatch = relativePath.match(/^teams\/(\d+)\//);
    if (teamMatch) {
      const fileTeamId = Number(teamMatch[1]);
      if (user.role !== "ADMIN") {
        let userTeamId: number | null = user.teamId ?? null;
        // Manager's team is via managedTeam, not teamId
        if (user.role === "MANAGER" && !userTeamId) {
          const { prisma } = await import("@/lib/prisma");
          const team = await prisma.team.findUnique({ where: { managerId: user.id } });
          userTeamId = team?.id ?? null;
        }
        if (userTeamId !== fileTeamId) {
          return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
        }
      }
    }

    const buffer = await readFile(resolved);
    const fileName = path.basename(resolved);
    const mimeType = getMimeType(fileName);

    const url = new URL(request.url);
    const download = url.searchParams.get("download") === "true";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(buffer.length),
        "Content-Disposition": download
          ? `attachment; filename="${encodeURIComponent(fileName)}"`
          : `inline; filename="${encodeURIComponent(fileName)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
  }
}
