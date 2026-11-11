import { NextResponse } from "next/server";
import { clearSessionCookie, getSessionStatus, isSecureRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const status = await getSessionStatus();
  const response = NextResponse.json({ status }, { headers: { "Cache-Control": "no-store" } });

  if (status !== "active") {
    response.cookies.set({ ...clearSessionCookie(), secure: isSecureRequest(request) });
  }

  return response;
}