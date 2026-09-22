import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "monitoring_admin_session";
const configuredSecret = process.env.JWT_SECRET;

if (process.env.NODE_ENV === "production" && !configuredSecret) {
  throw new Error("JWT_SECRET must be configured in production.");
}

const secret = new TextEncoder().encode(configuredSecret ?? "development-only-secret");

export async function createSessionToken(userId: number) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export const getSessionUser = cache(async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const userId = Number(payload.userId);

    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.isActive !== "ACTIVE") {
      return null;
    }

    return user;
  } catch {
    return null;
  }
});

export async function requireAdmin() {
  const user = await getSessionUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}

export async function requireManager() {
  const user = await getSessionUser();

  if (!user || user.role !== "MANAGER") {
    redirect("/");
  }

  return user;
}

export async function requireEmployee() {
  const user = await getSessionUser();

  if (!user || user.role !== "KARYAWAN") {
    redirect("/");
  }

  return user;
}

export function clearSessionCookie() {
  return {
    name: SESSION_COOKIE,
    value: "",
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}
