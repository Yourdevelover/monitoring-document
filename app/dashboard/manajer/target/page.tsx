import { redirect } from "next/navigation";
import { requireManajer } from "@/lib/auth";

export default async function ManagerTargetsPage() {
  await requireManajer();
  redirect("/dashboard/manajer/pengguna?role=TEAM_TARGETS");
}
