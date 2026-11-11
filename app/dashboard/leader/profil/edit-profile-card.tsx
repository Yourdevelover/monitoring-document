"use client";

import { useState } from "react";

type EditProfileCardProps = {
  name: string;
  email: string;
  phoneNumber: string;
  nik: string;
  address: string;
  role: string;
  isActive: string;
  createdAt: Date;
  department: string;
};

export function EditProfileCard({
  name,
  email,
  phoneNumber,
  nik,
  address,
  role,
  isActive,
  createdAt,
  department,
}: EditProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editVersion, setEditVersion] = useState(0);

  return (
    <section className="w-full overflow-hidden rounded-lg border border-[#dfe5ec] bg-white shadow-sm">
      <form action="/api/profile" method="POST">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-[#edf0f3] px-5 py-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <div aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#f1f3f5] text-2xl font-semibold text-[#18181b]">
              {name.trim().charAt(0).toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-[#111111]">Profil</h1>
              <p className="mt-0.5 text-xs text-[#6b7280]">Perbarui informasi akun dan data kontak Anda.</p>
              <span className={`mt-2 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-semibold ${isActive === "ACTIVE" ? "bg-[#edf3ec] text-[#346538]" : "bg-[#f3f4f6] text-[#6b7280]"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isActive === "ACTIVE" ? "bg-[#4f8a53]" : "bg-[#9ca3af]"}`} />
                {isActive === "ACTIVE" ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </div>
          <div className="mb-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                  setEditVersion((version) => version + 1);
                } else {
                  setIsEditing(true);
                }
              }}
              className="inline-flex h-9 items-center justify-center rounded-md border border-[#dfe5ec] bg-white px-4 text-xs font-semibold text-[#374151] transition-colors hover:bg-[#f3f5f7]"
            >
              {isEditing ? "Batal" : "Edit"}
            </button>
            <button
              type="submit"
              disabled={!isEditing}
              className="inline-flex h-9 items-center justify-center rounded-md bg-[#202a36] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#354454] disabled:cursor-not-allowed disabled:bg-[#9ca3af] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#202a36]"
            >
              Simpan
            </button>
          </div>
        </div>

        <div className="px-5 pb-5 sm:px-8">
          <div className="divide-y divide-[#edf0f3]">
            {isEditing ? (
              <>
                <label className="grid gap-2 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center sm:gap-6">
                  <span className="text-xs font-semibold text-[#374151]">Nama pengguna</span>
                  <input key={`name-${editVersion}`} name="name" defaultValue={name} required className="h-10 min-w-0 rounded-sm border border-[#dfe5ec] bg-white px-3 text-xs text-[#111111] outline-none focus:border-[#64748b] focus:ring-2 focus:ring-[#64748b]/15" />
                </label>
                <label className="grid gap-2 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center sm:gap-6">
                  <span className="text-xs font-semibold text-[#374151]">Email</span>
                  <input key={`email-${editVersion}`} name="email" type="email" defaultValue={email} required className="h-10 min-w-0 rounded-sm border border-[#dfe5ec] bg-white px-3 text-xs text-[#111111] outline-none focus:border-[#64748b] focus:ring-2 focus:ring-[#64748b]/15" />
                </label>
                <label className="grid gap-2 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center sm:gap-6">
                  <span className="text-xs font-semibold text-[#374151]">Nomor telepon</span>
                  <input key={`phone-${editVersion}`} name="phoneNumber" type="tel" defaultValue={phoneNumber} placeholder="Belum diisi" className="h-10 min-w-0 rounded-sm border border-[#dfe5ec] bg-white px-3 text-xs text-[#111111] outline-none focus:border-[#64748b] focus:ring-2 focus:ring-[#64748b]/15" />
                </label>
                <label className="grid gap-2 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center sm:gap-6">
                  <span className="text-xs font-semibold text-[#374151]">NIK</span>
                  <input key={`nik-${editVersion}`} name="nik" defaultValue={nik} placeholder="Belum diisi" className="h-10 min-w-0 rounded-sm border border-[#dfe5ec] bg-white px-3 text-xs text-[#111111] outline-none focus:border-[#64748b] focus:ring-2 focus:ring-[#64748b]/15" />
                </label>
                <label className="grid gap-2 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start sm:gap-6">
                  <span className="pt-2 text-xs font-semibold text-[#374151]">Alamat</span>
                  <textarea key={`address-${editVersion}`} name="address" defaultValue={address} rows={3} placeholder="Tambahkan alamat" className="min-h-24 min-w-0 resize-y rounded-sm border border-[#dfe5ec] bg-white px-3 py-2.5 text-xs text-[#111111] outline-none focus:border-[#64748b] focus:ring-2 focus:ring-[#64748b]/15" />
                </label>
              </>
            ) : (
              <>
                {[
                  ["Nama pengguna", name],
                  ["Email", email],
                  ["Nomor telepon", phoneNumber || "Belum diisi"],
                  ["NIK", nik || "Belum diisi"],
                  ["Alamat", address || "Belum diisi"],
                ].map(([label, value]) => (
                  <div key={label} className="grid gap-2 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center sm:gap-6">
                    <span className="text-xs font-semibold text-[#374151]">{label}</span>
                    <span className={`break-words text-xs ${value === "Belum diisi" ? "text-[#9ca3af]" : "text-[#111111]"}`}>{value}</span>
                  </div>
                ))}
              </>
            )}
            <div className="grid gap-2 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center sm:gap-6">
              <span className="text-xs font-semibold text-[#374151]">Departemen</span>
              <span className="text-xs text-[#626d78]">{department || "Belum diatur"}</span>
            </div>
            <div className="grid gap-2 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center sm:gap-6">
              <span className="text-xs font-semibold text-[#374151]">Peran</span>
              <span className="text-xs text-[#626d78]">{role}</span>
            </div>
            <div className="grid gap-2 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center sm:gap-6">
              <span className="text-xs font-semibold text-[#374151]">Bergabung</span>
              <span className="text-xs text-[#626d78]">{new Date(createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</span>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
