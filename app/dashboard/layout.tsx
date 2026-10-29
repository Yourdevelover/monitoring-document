import { getSessionUser } from "@/lib/auth";
import { NotesWidget } from "@/app/components/notes-widget";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  return (
    <>
      {user && <NotesWidget initialNotes={[]} />}
      {children}
    </>
  );
}
