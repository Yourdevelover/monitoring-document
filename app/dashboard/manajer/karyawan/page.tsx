import { redirect } from "next/navigation";
import { requireManajer } from "@/lib/auth";

export default async function ManagerEmployeesPage() {
  await requireManajer();
  redirect("/dashboard/manajer/pengguna?role=KARYAWAN");
}
