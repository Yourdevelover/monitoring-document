import path from "path";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createSignedDownloadUrl } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  try {
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

    const url = new URL(request.url);
    const fileName = path.basename(relativePath);
    const signedUrl = await createSignedDownloadUrl(
      `/uploads/${relativePath}`,
      url.searchParams.get("download") === "true" ? fileName : ""
    );
    return NextResponse.redirect(signedUrl, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("File access failed:", error);
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
  }
}
