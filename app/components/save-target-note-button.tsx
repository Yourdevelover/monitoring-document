"use client";

import { useState } from "react";
import { toast } from "@/app/components/toast";

export function SaveTargetNoteButton({
  name,
  current,
  target,
  pct,
}: {
  name: string;
  current: number;
  target: number;
  pct: number;
}) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setError("");
    const formatValue = (value: number) =>
      new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(value);
    const content = `Target ${name}: ${formatValue(current)}/${formatValue(target)} (${pct.toFixed(1)}%)`;
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (response.ok) {
      setSaved(true);
      const note = await response.json();
      window.dispatchEvent(new CustomEvent("note-saved", { detail: note }));
      toast("Catatan tersimpan.", "success");
      return;
    }

    const result = await response.json();
    const message = result.error ?? "Gagal menyimpan.";
    setError(message);
    toast(message, "error");
  }

  return (
    <div>
      <button
        type="button"
        onClick={save}
        disabled={saved}
        className="text-[11px] font-semibold text-[#1f6c9f] hover:text-[#1d4ed8] disabled:text-[#346538]"
      >
        {saved ? "✓ Tersimpan ke catatan" : "+ Simpan ke catatan"}
      </button>
      {error && <p className="mt-1 text-[10px] text-[#9f2f2d]">{error}</p>}
    </div>
  );
}
