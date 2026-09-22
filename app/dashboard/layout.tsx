import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NotesWidget } from "@/app/components/notes-widget";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  const notes = user
    ? await prisma.$queryRaw<Array<{ id: number; content: string; createdAt: Date; updatedAt: Date }>>(
        Prisma.sql`SELECT id, content, "createdAt", "updatedAt" FROM personal_notes WHERE "userId" = ${user.id} ORDER BY "updatedAt" DESC`
      )
    : [];

  return (
    <>
      {user && <NotesWidget initialNotes={notes} />}
      {children}
    </>
  );
}
