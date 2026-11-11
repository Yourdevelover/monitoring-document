"use client";

import { GeneratedPasswordInput } from "@/app/components/generated-password-input";

export function EmployeeCreateForm() {
  return (
    <form action="/api/leader/employee/create" method="POST" className="mt-6 grid gap-4 sm:grid-cols-2">
      <label className="grid gap-1.5 text-sm font-medium">
        Nama
        <input name="name" type="text" required autoComplete="name" className="rounded-md border border-[#d1d5db] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Email
        <input name="email" type="email" required autoComplete="email" className="rounded-md border border-[#d1d5db] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Jabatan
        <input name="position" type="text" required className="rounded-md border border-[#d1d5db] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
        Password
        <GeneratedPasswordInput id="employee-password" className="min-w-0 flex-1 rounded-md border border-[#d1d5db] bg-white px-3 py-2.5 font-mono text-sm tracking-[0.16em] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20" />
      </label>
      <button type="submit" className="min-h-10 rounded-md bg-[#2563eb] px-4 text-sm font-semibold text-white hover:bg-[#1d4ed8] sm:col-span-2 sm:justify-self-start">
        Simpan Karyawan
      </button>
    </form>
  );
}