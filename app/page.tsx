import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { Logo } from "@/app/components/logo";
import { LoginForm } from "@/app/login-form";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ registration?: string }> }) {
  const user = await getSessionUser();
  const params = await searchParams;

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
          {params.registration === "pending" && (
            <p role="status" className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
              Pendaftaran berhasil. Akun Anda menunggu persetujuan admin; Anda bisa masuk setelah disetujui.
            </p>
          )}
          <LoginForm />

          <div className="mt-4 text-center text-sm text-[#6b7280]">
            Daftar sebagai manajer{" "}
            <Link href="/daftar-manajer" className="font-medium text-[#2563eb] hover:underline">
              Daftar
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
