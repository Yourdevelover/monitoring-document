"use client";
import { useState } from "react";

export function ActivityRow({ activity }: { activity: { id: number; createdAt: string; action: string; description: string | null; actor: { name: string | null } | null } }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        className="cursor-pointer border-b border-[#f1f3f5] last:border-0 hover:bg-[#f8f9fa]"
        onClick={() => setOpen((v) => !v)}
      >
        <td className="whitespace-nowrap px-2 py-1 text-[#6b7280]">{new Date(activity.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}</td>
        <td className="max-w-[10rem] truncate whitespace-nowrap px-2 py-1 font-medium" title={activity.actor?.name ?? "System"}>{activity.actor?.name ?? "System"}</td>
        <td className="whitespace-nowrap px-2 py-1"><span className="rounded bg-[#f1f3f5] px-1 py-px text-[10px] font-medium">{activity.action}</span></td>
        <td className="max-w-[24rem] truncate px-2 py-1 text-[#6b7280]" title={activity.description ?? ""}>{activity.description}</td>
      </tr>
      {open && (
        <tr className="border-b border-[#f1f3f5] bg-[#f8f9fa]">
          <td colSpan={4} className="px-4 py-2 text-[11px]">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
              <dt className="font-semibold text-[#111111]">Waktu</dt>
              <dd className="text-[#6b7280]">{new Date(activity.createdAt).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "long" })}</dd>
              <dt className="font-semibold text-[#111111]">Aktor</dt>
              <dd className="text-[#6b7280]">{activity.actor?.name ?? "System"}</dd>
              <dt className="font-semibold text-[#111111]">Aksi</dt>
              <dd className="text-[#6b7280]">{activity.action}</dd>
              <dt className="font-semibold text-[#111111]">Deskripsi</dt>
              <dd className="text-[#6b7280]">{activity.description ?? "-"}</dd>
            </dl>
          </td>
        </tr>
      )}
    </>
  );
}
