import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardAutoRefresh } from "@/app/components/dashboard-auto-refresh";
import { NotesWidget } from "@/app/components/notes-widget";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  const storedNotes = user && user.role !== "MANAJER"
    ? await prisma.user.findUnique({ where: { id: user.id }, select: { personalNotes: true } })
    : null;
  const notes = Array.isArray(storedNotes?.personalNotes)
    ? storedNotes.personalNotes.map((value) => {
        const note = value as { id: number; content: string; createdAt: string; updatedAt: string };
        return { ...note, createdAt: new Date(note.createdAt), updatedAt: new Date(note.updatedAt) };
      }).sort((first, second) => second.updatedAt.getTime() - first.updatedAt.getTime())
    : [];

  return (
    <>
      <DashboardAutoRefresh />
      {user && user.role !== "MANAJER" && <NotesWidget initialNotes={notes} />}
      {children}
    </>
  );
}
