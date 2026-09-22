import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This endpoint can be called by a cron job to clean up expired files
export async function GET(request: Request) {
  try {
    // Check for auth token in headers (optional security measure)
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CLEANUP_SECRET_TOKEN;

    if (!expectedToken && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Cleanup secret is not configured." },
        { status: 503 }
      );
    }

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();

    // Find all expired files
    const expiredFiles = await prisma.upload.findMany({
      where: {
        expiresAt: {
          lte: now,
        },
        isImportant: false,
      },
    });

    console.log(`Found ${expiredFiles.length} expired files to clean up`);

    return NextResponse.json({
      success: true,
      message: `${expiredFiles.length} expired files remain available in history`,
      expiredCount: expiredFiles.length,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST method for manual trigger
export async function POST(request: Request) {
  return GET(request);
}
