import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";
import { Logo } from "@/app/components/logo";

export default function ManagerRegistrationPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f9fa] px-6 py-12 text-[#111111]">
      <div className="w-full max-w-md">
        <div className="mb-1 flex items-end justify-between gap-3">
          <Logo className="h-16 w-auto shrink-0" />
          <p className="text-right text-[10px] leading-snug text-[#9ca3af]">
            Daftar sebagai manajer baru
          </p>
        </div>

        <form action="/api/manager/register" method="POST" className="rounded-lg border border-[#e5e7eb] bg-white p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                Nama
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full rounded-md border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-md border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-md border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-[#111111] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#333333] active:scale-[0.98]"
            >
              Daftar
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-[#6b7280]">
            Sudah punya akun{" "}
            <a href="/" className="font-medium text-[#2563eb] hover:underline">
              Masuk
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
