"use client";

import { useState } from "react";
import Link from "next/link";

type EmployeeProfile = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  isActive: string;
  profilePicture: string | null;
  createdAt: Date;
  latestLoginAt?: Date | null;
};

type EmployeeProfileCardProps = {
  employee: EmployeeProfile;
  files?: Array<{
    id: number;
    fileName: string;
    filePath: string;
    category: string;
    status: string;
    isSubmitted: boolean;
    submissionDate: Date;
    expiresAt: Date | null;
  }>;
  mode?: "avatar" | "name" | "row";
};

export function EmployeeProfileCard({ employee, files = [], mode = "avatar" }: EmployeeProfileCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const initials = employee.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const triggerClassName = mode === "avatar"
    ? "flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#e5e7eb] text-xs font-semibold text-[#6b7280] hover:ring-2 hover:ring-[#d1d5db]"
    : mode === "name"
      ? "truncate text-left font-medium text-[#1f6c9f] hover:text-[#1d4ed8]"
      : "absolute inset-0 z-10 flex items-center gap-3 px-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title={`Lihat profil ${employee.name}`}
        aria-label={`Lihat profil ${employee.name}`}
        className={triggerClassName}
      >
        {mode === "avatar" ? (
          employee.profilePicture ? (
            <img src={employee.profilePicture} alt={employee.name} className="h-full w-full object-cover" />
          ) : initials
        ) : mode === "name" ? employee.name : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e5e7eb] text-xs font-semibold text-[#6b7280]">
            {employee.profilePicture ? (
              <img src={employee.profilePicture} alt={employee.name} className="h-full w-full object-cover" />
            ) : initials}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/30 p-4" onClick={() => setIsOpen(false)}>
          <section
            role="dialog"
            aria-label={`Informasi ${employee.name}`}
            className="w-full max-w-sm rounded-lg border border-[#e5e7eb] bg-white p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-[#e5e7eb] pb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e5e7eb] font-semibold text-[#6b7280]">
                {employee.profilePicture ? (
                  <img src={employee.profilePicture} alt={employee.name} className="h-full w-full object-cover" />
                ) : initials}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-[#111111]">{employee.name}</h2>
                <p className="truncate text-sm text-[#6b7280]">{employee.email}</p>
              </div>
            </div>
            <dl className="divide-y divide-slate-100 text-sm">
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-[#6b7280]">Status</dt>
                <dd className="font-medium text-[#111111]">{employee.isActive}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-[#6b7280]">Nomor telepon</dt>
                <dd className="text-right font-medium text-[#111111]">{employee.phoneNumber ?? "-"}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-[#6b7280]">Bergabung</dt>
                <dd className="text-right font-medium text-[#111111]">
                  {new Date(employee.createdAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-[#6b7280]">Login terakhir</dt>
                <dd className="text-right font-medium text-[#111111]">
                  {employee.latestLoginAt ? new Date(employee.latestLoginAt).toLocaleString("id-ID") : "Belum ada data"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-[#6b7280]">Status berkas</dt>
                <dd className="flex flex-wrap justify-end gap-2 text-xs font-medium text-[#111111]">
                  {["DATA_A", "DATA_B", "DATA_C"].map((category) => {
                    const file = files.find((item) => item.category === category);
                    return (
                      <span key={category}>
                        {file?.isSubmitted ? (
                          <Link
                            href={`/dashboard/manajer/berkas/${category.toLowerCase().replace("data_", "data-")}/${file.id}`}
                            className="text-[#1f6c9f] hover:text-[#1d4ed8] hover:underline"
                          >
                            ✓ {category.replace("DATA_", "Data ")}
                          </Link>
                        ) : (
                          <span className="text-[#6b7280]">✕ {category.replace("DATA_", "Data ")}</span>
                        )}
                      </span>
                    );
                  })}
                </dd>
              </div>
            </dl>
                    <Link
              href={`/dashboard/manajer/karyawan/${employee.id}`}
              className="mt-4 block w-full rounded-lg border border-[#e1f3fe] px-3 py-2 text-center text-sm font-medium text-[#1f6c9f] hover:bg-[#e1f3fe]"
            >
              Lihat info lebih lanjut
                    </Link>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-2 w-full rounded-lg bg-[#111111] px-3 py-2 text-sm font-medium text-white hover:bg-[#333333]"
            >
              Tutup
            </button>
          </section>
        </div>
      )}
    </>
  );
}
