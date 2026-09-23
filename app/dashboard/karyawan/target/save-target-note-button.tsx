"use client";

import { useState } from "react";

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
    const fmt = (n: number) =>
      new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(n);
    const content = `Target ${name}: ${fmt(current)}/${fmt(target)} (${pct.toFixed(1)}%)`;
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      setSaved(true);
      const note = await res.json();
      window.dispatchEvent(new CustomEvent("note-saved", { detail: note }));
    } else {
      const r = await res.json();
      setError(r.error ?? "Gagal menyimpan.");
    }
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