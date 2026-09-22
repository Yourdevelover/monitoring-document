import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (user) {
    await prisma.activityLog.create({
      data: {
        actorId: user.id,
        action: "LOGOUT",
        targetType: "USER",
        targetId: user.id,
        description: `${user.role} keluar dari dashboard.`,
      },
    });
  }

  const response = NextResponse.redirect(new URL("/", request.url));

  response.cookies.set("monitoring_admin_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
