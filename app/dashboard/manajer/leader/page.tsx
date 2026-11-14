import { redirect } from "next/navigation";
import { requireManajer } from "@/lib/auth";

export default async function ManagerLeadersPage() {
  await requireManajer();
  redirect("/dashboard/manajer/pengguna?role=LEADER");
}