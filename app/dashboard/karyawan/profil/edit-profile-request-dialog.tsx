"use client";

import { useState } from "react";

type EditProfileRequestDialogProps = {
  name: string;
  email: string;
  phoneNumber: string | null;
};

export function EditProfileRequestDialog({ name, email, phoneNumber }: EditProfileRequestDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="shrink-0 rounded-md border border-[#e5e7eb] px-3 py-2 text-xs font-semibold text-[#111111] transition hover:bg-[#f8f9fa]"
      >
        Edit Profil
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#111111]/40 p-4"
          onClick={() => setIsOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-employee-profile-title"
            className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg border border-[#e5e7eb] bg-white p-5 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-[#e5e7eb] pb-3">
              <div>
                <h2 id="edit-employee-profile-title" className="text-base font-semibold">Edit Profil</h2>
                <p className="mt-1 text-sm text-[#6b7280]">Perubahan akan dikirim ke manajer untuk disetujui.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup edit profil"
                className="shrink-0 rounded-md px-2 py-1 text-sm text-[#6b7280] hover:bg-[#f8f9fa] hover:text-[#111111]"
              >
                Tutup
              </button>
            </div>

            <form action="/api/karyawan/profile-request" method="POST" className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="employee-profile-name" className="mb-1 block text-sm font-medium text-[#374151]">
                  Nama
                </label>
                <input
                  id="employee-profile-name"
                  name="name"
                  type="text"
                  defaultValue={name}
                  className="w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2.5 text-sm text-[#374151] outline-none transition focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label htmlFor="employee-profile-phone" className="mb-1 block text-sm font-medium text-[#374151]">
                  Nomor Telepon
                </label>
                <input
                  id="employee-profile-phone"
                  name="phoneNumber"
                  type="tel"
                  defaultValue={phoneNumber ?? ""}
                  className="w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2.5 text-sm text-[#374151] outline-none transition focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label htmlFor="employee-profile-email" className="mb-1 block text-sm font-medium text-[#374151]">
                  Email
                </label>
                <input
                  id="employee-profile-email"
                  name="email"
                  type="email"
                  defaultValue={email}
                  className="w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2.5 text-sm text-[#374151] outline-none transition focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label htmlFor="employee-profile-password" className="mb-1 block text-sm font-medium text-[#374151]">
                  Password Baru
                </label>
                <input
                  id="employee-profile-password"
                  name="password"
                  type="password"
                  minLength={6}
                  placeholder="Kosongkan jika tidak diganti"
                  className="w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2.5 text-sm text-[#374151] outline-none transition focus:border-[#2563eb]"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t border-[#e5e7eb] pt-4 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md border border-[#e5e7eb] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f8f9fa]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#111111] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#222222]"
                >
                  Ajukan Perubahan
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}