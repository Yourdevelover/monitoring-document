import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/auth";
import { hash } from "bcryptjs";

export async function POST(request: Request) {
  try {
    const manager = await requireManager();

    const formData = await request.formData();
    const requestId = Number(formData.get("requestId") ?? 0);
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
      where: { managerId: manager.id },
    });

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          error: "Tim manajer tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const profileRequests = requestId
      ? await prisma.profileRequest.findMany({
          where: {
            id: requestId,
            status: "PENDING",
            user: {
              teamId: team.id,
            },
          },
          include: {
            user: true,
          },
        })
      : await prisma.profileRequest.findMany({
          where: {
            status: "PENDING",
            user: {
              teamId: team.id,
            },
          },
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

    if (profileRequests.length === 0) {
      return NextResponse.redirect(new URL("/dashboard/manajer/pengajuan-profil", request.url));
    }

    const processedRequestIds = [] as number[];

    for (const profileRequest of profileRequests) {
      if (action === "approve") {
        const updateData: Record<string, string> = {};

        const payload =
          profileRequest.fieldName === "profile" && profileRequest.newValue
            ? JSON.parse(profileRequest.newValue)
            : {
                [profileRequest.fieldName]: profileRequest.newValue,
              };

        if (typeof payload.name === "string" && payload.name.trim()) {
          updateData.name = payload.name.trim();
        }

        if (typeof payload.email === "string" && payload.email.trim()) {
          updateData.email = payload.email.trim().toLowerCase();
        }

        if (typeof payload.password === "string" && payload.password.length >= 6) {
          updateData.passwordHash = await hash(payload.password, 10);
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.user.update({
            where: { id: profileRequest.userId },
            data: updateData,
          });
        }

        processedRequestIds.push(profileRequest.id);
      } else {
        processedRequestIds.push(profileRequest.id);
      }
    }

    await prisma.profileRequest.deleteMany({
      where: {
        id: {
          in: processedRequestIds,
        },
      },
    });

    return NextResponse.redirect(new URL("/dashboard/manajer/pengajuan-profil", request.url));
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
