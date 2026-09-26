import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Logo } from "@/app/components/logo";
import { LoginForm } from "@/app/login-form";

export default async function HomePage() {
  const user = await getSessionUser();

  if (user?.role === "ADMIN") {
    redirect("/dashboard/admin");
  }

  if (user?.role === "MANAGER") {
    redirect("/dashboard/manajer");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f9fa] px-6 py-12 text-[#111111]">
      <div className="w-full max-w-md">
        <div className="mb-1 flex items-end justify-between gap-3">
          <Logo className="h-16 w-auto shrink-0" />
          <p className="text-right text-[10px] leading-snug text-[#9ca3af]">
            Login dengan akun yang sudah manajer buat
          </p>
        </div>

        <section className="rounded-lg border border-[#e5e7eb] bg-white p-6">
          <LoginForm />

          <div className="mt-4 text-center text-sm text-[#6b7280]">
            Daftar sebagai manajer{" "}
            <a href="/daftar-manajer" className="font-medium text-[#2563eb] hover:underline">
              Daftar
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
