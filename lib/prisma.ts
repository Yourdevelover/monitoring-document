import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const databaseUrl = process.env.DATABASE_URL;
const databaseUrlObject = databaseUrl ? new URL(databaseUrl) : undefined;

if (
  databaseUrlObject?.hostname.endsWith(".pooler.supabase.com") &&
  databaseUrlObject.port === "6543"
) {
  databaseUrlObject.searchParams.set("pgbouncer", "true");
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(databaseUrlObject ? { datasources: { db: { url: databaseUrlObject.toString() } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
