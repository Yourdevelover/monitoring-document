"use client";

import { useState } from "react";
import { GeneratedPasswordInput } from "@/app/components/generated-password-input";

type LeaderOption = {
  id: number;
  name: string;
  email: string;
  teamName: string | null;
  teamIsActive: boolean | null;
  departmentName: string | null;
  departmentIsActive: boolean;
};

export function EmployeeCreateForm({
  leaders,
}: {
  leaders: LeaderOption[];
}) {
  const [leaderId, setLeaderId] = useState("");
  const selectedLeader = leaders.find((leader) => String(leader.id) === leaderId);
  const eligibleLeaders = leaders.filter((leader) =>
    leader.departmentName && leader.departmentIsActive && leader.teamIsActive !== false
  );

  return (
    <form action="/api/admin/karyawan/create" method="POST" className="grid max-w-2xl gap-3">
      <input name="name" placeholder="Nama karyawan" required className="border border-[#e5e7eb] px-3 py-2 text-sm" />
      <input name="email" type="email" placeholder="Email" required className="border border-[#e5e7eb] px-3 py-2 text-sm" />
      <input name="phoneNumber" type="tel" placeholder="Nomor telepon" className="border border-[#e5e7eb] px-3 py-2 text-sm" />
      <label className="grid gap-1 text-xs font-medium text-[#111111]">
        Password
        <GeneratedPasswordInput className="min-w-0 flex-1 rounded-md border border-[#e5e7eb] px-3 py-2 text-sm" />
      </label>
      <label className="grid gap-1 text-xs font-medium text-[#111111]">
        Leader
        <select
          name="leaderId"
          required
          value={leaderId}
          onChange={(event) => setLeaderId(event.target.value)}
          className="border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-normal"
        >
          <option value="">Pilih Leader</option>
          {eligibleLeaders.map((leader) => (
            <option key={leader.id} value={leader.id}>{leader.name} · {leader.email}</option>
          ))}
        </select>
      </label>
      {selectedLeader?.departmentName && <p className="text-xs text-[#6b7280]">{selectedLeader.teamName ? `Tim: ${selectedLeader.teamName} · ` : "Tim akan dibuat · "}Departemen: {selectedLeader.departmentName}</p>}
      {eligibleLeaders.length === 0 && <p className="text-xs text-[#9f2f2d]">Belum ada Leader aktif dengan departemen aktif. Periksa data tim dan departemen Leader.</p>}
      <button type="submit" disabled={!leaderId || eligibleLeaders.length === 0} className="btn btn-primary w-fit disabled:cursor-not-allowed disabled:opacity-50">Simpan Karyawan</button>
    </form>
  );
}