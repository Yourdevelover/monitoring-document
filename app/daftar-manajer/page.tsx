import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";

export default function ManagerRegistrationPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-12 text-[#111111]">
      <div className="mx-auto max-w-xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6b7280]">
            Monitoring System
          </p>
          <h1 className="mt-3 text-base font-bold tracking-tight">Daftar Manajer</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#6b7280]">
            Buat akun manajer untuk mengelola berkas dan pengumuman tim.
          </p>
        </div>

        <form action="/api/manager/register" method="POST" className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Nama Lengkap
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
            Daftar sebagai Manajer
          </button>
        </form>
      </div>
    </main>
  );
}
