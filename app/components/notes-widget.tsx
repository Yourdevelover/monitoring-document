"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

type Note = {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

function parseTargetNote(content: string): { name: string; pct: number } | null {
  const m = content.trim().match(/^Target (.+): .+ \(([\d.,]+)%\)$/);
  if (!m) return null;
  const pct = Number(m[2].replace(",", "."));
  if (Number.isNaN(pct)) return null;
  return { name: m[1], pct: Math.max(0, Math.min(100, pct)) };
}

export function NotesWidget({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null);
  const pathname = usePathname();
  const isHiddenPath = pathname.startsWith("/dashboard/admin") || pathname.endsWith("/profil");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isHiddenPath) return;

    const header = document.querySelector<HTMLElement>("main header");
    if (!header) return;

    header.classList.add("flex", "flex-wrap", "items-start", "justify-between", "gap-4");
    const slot = document.createElement("div");
    slot.className = "dashboard-notes-slot w-full shrink-0 sm:ml-auto sm:max-w-md lg:max-w-lg";
    header.appendChild(slot);
    const resizeObserver = new ResizeObserver(() => {
      header.style.minHeight = `${Math.max(128, slot.offsetHeight + 40)}px`;
    });
    const frame = window.requestAnimationFrame(() => {
      setHeaderSlot(slot);
      resizeObserver.observe(slot);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      slot.remove();
      header.style.removeProperty("min-height");
      header.classList.remove("flex", "flex-wrap", "items-start", "justify-between", "gap-4");
    };
  }, [isHiddenPath, pathname]);

  useEffect(() => {
    function onNoteSaved(event: Event) {
      const detail = (event as CustomEvent).detail;
      if (detail) setNotes((current) => [detail, ...current]);
    }
    window.addEventListener("note-saved", onNoteSaved);
    return () => window.removeEventListener("note-saved", onNoteSaved);
  }, []);

  async function saveNote() {
    setError("");
    const method = editingId ? "PATCH" : "POST";
    const response = await fetch("/api/notes", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, content }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Catatan gagal disimpan.");
      return;
    }
    if (editingId) {
      setNotes((current) => current.map((note) => note.id === editingId ? { ...note, content, updatedAt: new Date() } : note));
    } else {
      setNotes((current) => [result, ...current]);
    }
    setContent("");
    setEditingId(null);
    setIsCreatingNew(false);
    setIsOpen(false);
  }

  async function deleteNote(id: number) {
    const response = await fetch("/api/notes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (response.ok) setNotes((current) => current.filter((note) => note.id !== id));
  }

  function editNote(note: Note) {
    setIsCreatingNew(false);
    setEditingId(note.id);
    setContent(note.content);
  }

  function addNote() {
    setEditingId(null);
    setContent("");
    setError("");
    setIsCreatingNew(true);
    setIsOpen(true);
  }

  const card = (
    <>
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={addNote}
          aria-label="Tambah catatan"
          title="Tambah catatan"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-lg font-medium text-slate-600 transition hover:border-slate-500 hover:bg-slate-50"
        >
          +
        </button>
        <div className="flex min-w-0 flex-1 items-start gap-2">
          {notes.length > 0 ? notes.slice(0, 4).map((note) => {
            const t = parseTargetNote(note.content);
            return (
            <button
              key={note.id}
              type="button"
              onClick={() => {
                setIsCreatingNew(false);
                setIsOpen(true);
              }}
              className="relative h-20 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white p-2 text-left transition hover:border-slate-400 hover:"
            >
              {t && (
                <span className={`absolute -right-1.5 -top-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${t.pct >= 100 ? "bg-[#346538] text-white" : "bg-[#956400] text-white"}`}>{t.pct}%</span>
              )}
              <p className="line-clamp-2 min-h-8 whitespace-pre-wrap break-words text-xs text-slate-800">{note.content}</p>
              {t && (
                <div className="mt-1 h-1.5 rounded bg-slate-100">
                  <div className={`h-full rounded ${t.pct >= 100 ? "bg-[#346538]" : "bg-[#956400]"}`} style={{ width: `${t.pct}%` }} />
                </div>
              )}
              <p className="mt-1 truncate text-[10px] text-slate-400">{new Date(note.updatedAt).toLocaleDateString("id-ID")}</p>
            </button>
            );
          }) : (
            <div className="h-20 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white p-2">
              <p className="text-xs text-slate-500">Belum ada catatan.</p>
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4" onClick={() => setIsOpen(false)}>
          <div role="dialog" aria-label="Catatan pribadi" className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-5" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Pribadi</p>
                <h2 className="mt-1 text-sm font-semibold text-slate-900">
                  {editingId ? "Edit Catatan" : isCreatingNew ? "Catatan Baru" : "Catatan"}
                </h2>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Tutup catatan" className="rounded-lg px-2 py-1 text-lg leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700">×</button>
            </div>

            {!isCreatingNew && (
              <div className="mt-4 space-y-3">
                {notes.map((note) => {
                  const t = parseTargetNote(note.content);
                  return (
                  <article key={note.id} className="rounded-lg border border-slate-200 p-3">
                    <p className="whitespace-pre-wrap break-words text-sm text-slate-800">{note.content}</p>
                    {t && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-2 flex-1 rounded bg-slate-100">
                          <div className={`h-full rounded ${t.pct >= 100 ? "bg-[#346538]" : "bg-[#956400]"}`} style={{ width: `${t.pct}%` }} />
                        </div>
                        <span className={`text-xs font-semibold ${t.pct >= 100 ? "text-[#346538]" : "text-[#956400]"}`}>{t.pct}%</span>
                      </div>
                    )}
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-2">
                      <time className="text-xs text-slate-400">{new Date(note.updatedAt).toLocaleString("id-ID")}</time>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => editNote(note)} className="text-xs font-semibold text-blue-700 hover:underline">Edit</button>
                        <button type="button" onClick={() => deleteNote(note.id)} className="text-xs font-semibold text-red-700 hover:underline">Hapus</button>
                      </div>
                    </div>
                  </article>
                  );
                })}
                {notes.length === 0 && <p className="border-y border-dashed border-slate-300 py-6 text-center text-sm text-slate-500">Belum ada catatan.</p>}
              </div>
            )}

            <div className="mt-5 border-t border-slate-200 pt-4">
              <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={4} placeholder={editingId ? "Ubah catatan..." : "Tulis catatan pribadi..."} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <div className="mt-3 flex justify-end gap-2">
                {editingId && <button type="button" onClick={() => { setEditingId(null); setContent(""); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700">Batal</button>}
                <button type="button" onClick={saveNote} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">{editingId ? "Simpan Perubahan" : "Tambah Catatan"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (isHiddenPath) return null;

  return headerSlot ? createPortal(card, headerSlot) : null;
}