import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireLeader } from "@/lib/auth";
import { getBaseUrl } from "@/lib/redirect";
import { processProfileRequestDecisions } from "@/lib/profile-requests";

export async function POST(request: Request) {
  try {
    const leader = await requireLeader();

    const formData = await request.formData();
    const requestId = String(formData.get("requestId") ?? "");
    const action = String(formData.get("action") ?? "");

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: "Permintaan tidak valid.",
        },
        { status: 400 }
      );
    }

    const team = await prisma.team.findUnique({
      where: { leaderId: leader.id },
    });

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          error: "Tim leader tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const processedCount = await processProfileRequestDecisions({
      action: action as "approve" | "reject",
      reviewerId: leader.id,
      teamId: team.id,
      ...(requestId ? { requestId } : {}),
    });

    if (processedCount === 0) {
      return NextResponse.redirect(new URL("/dashboard/leader/pengajuan-profil?toast=" + encodeURIComponent("Tidak ada permintaan yang perlu diproses."), getBaseUrl(request)));
    }

    return NextResponse.redirect(new URL("/dashboard/leader/pengajuan-profil?toast=" + encodeURIComponent(action === "approve" ? "Permintaan profil disetujui." : "Permintaan profil ditolak."), getBaseUrl(request)));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server saat memproses permintaan profil.",
      },
      { status: 500 }
    );
  }
}
