import { redirect } from "next/navigation";
import { requireManajer } from "@/lib/auth";

export default async function ManagerEmployeeCreatePage() {
  await requireManajer();
  redirect("/dashboard/manajer/karyawan");
}
