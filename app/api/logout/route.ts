import { NextResponse } from "next/server";
import { getSessionUser, isSecureRequest } from "@/lib/auth";
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

  const host = request.headers.get("host") ?? "localhost:3000";
  const safeHost = host.replace(/^0\.0\.0\.0/, "localhost");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const response = NextResponse.redirect(new URL("/?toast=" + encodeURIComponent("Berhasil keluar."), `${proto}://${safeHost}`));

  response.cookies.set("monitoring_admin_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: 0,
  });

  return response;
}
