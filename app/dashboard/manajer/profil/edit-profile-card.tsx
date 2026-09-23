"use client";

import { useState } from "react";

type EditProfileCardProps = {
  name: string;
  email: string;
  phoneNumber: string;
};

export function EditProfileCard({ name, email, phoneNumber }: EditProfileCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-800"
      >
        Edit Profil
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/30 p-4" onClick={() => setIsOpen(false)}>
          <section
            role="dialog"
            aria-label="Edit Profil Manajer"
            className="w-full max-w-md rounded-lg border border-[#e5e7eb] bg-white p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-[#e5e7eb] pb-3">
              <h2 className="text-base font-semibold">Edit Profil</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-sm text-[#6b7280] hover:text-[#111111]">
                Tutup
              </button>
            </div>
            <form action="/api/profile" method="POST" className="grid gap-3">
              <input name="name" defaultValue={name} placeholder="Nama" required className="border border-[#e5e7eb] px-3 py-2" />
              <input name="email" type="email" defaultValue={email} placeholder="Email" required className="border border-[#e5e7eb] px-3 py-2" />
              <input name="phoneNumber" type="tel" defaultValue={phoneNumber} placeholder="Nomor telepon (opsional)" className="border border-[#e5e7eb] px-3 py-2" />
              <input name="password" type="password" placeholder="Password baru (opsional)" minLength={6} className="border border-[#e5e7eb] px-3 py-2" />
              <button type="submit" className="w-fit bg-[#111111] px-4 py-2 text-sm font-medium text-white">
                Simpan Perubahan
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
