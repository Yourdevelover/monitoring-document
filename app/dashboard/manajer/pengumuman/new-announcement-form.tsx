"use client";

import { useRef, useState, type CSSProperties } from "react";
import EmojiPicker from "emoji-picker-react";

export function NewAnnouncementForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const insertEmoji = (emoji: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    textarea.value = `${textarea.value.slice(0, start)}${emoji}${textarea.value.slice(end)}`;
    textarea.focus();
    textarea.setSelectionRange(start + emoji.length, start + emoji.length);
  };

  return (
    <section className="flex justify-start rounded-lg border border-[#e5e7eb] bg-white px-6 py-1">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="rounded-lg bg-[#2563eb] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
      >
        {isOpen ? "Tutup Form" : "Buat Pengumuman Baru"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/40 p-4">
          <div className="w-full max-w-lg rounded-lg border border-[#e5e7eb] bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#111111]">Buat Pengumuman Baru</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup form pengumuman"
                className="rounded-lg px-2 py-1 text-xl leading-none text-[#6b7280] hover:bg-[#f8f9fa] hover:text-[#111111]"
              >
                X
              </button>
            </div>
            <form action="/api/manager/announcement/create" method="POST" className="mt-4 space-y-4">
              <input
                name="title"
                maxLength={150}
                placeholder="Judul pengumuman (opsional)"
                className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <textarea
                ref={contentRef}
                name="content"
                required
                maxLength={2000}
                rows={4}
                placeholder="Tulis pesan untuk tim..."
                className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <div className="relative border-b border-[#e5e7eb] pb-3">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((current) => !current)}
                  className="border border-[#e5e7eb] px-3 py-1.5 text-sm text-[#111111] hover:bg-[#f8f9fa]"
                >
                  ðŸ˜Š Pilih Emoji
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 z-20 mb-2">
                    <EmojiPicker
                      width={320}
                      height={320}
                      className="announcement-emoji-picker"
                      previewConfig={{
                        showPreview: true,
                        defaultCaption: "What's Your Mood?",
                      }}
                      style={{
                        "--epr-header-padding": "5px 8px",
                        "--epr-search-input-height": "28px",
                        "--epr-search-input-padding": "0 24px",
                        "--epr-category-navigation-button-size": "22px",
                        "--epr-category-label-height": "22px",
                        "--epr-category-label-padding": "0 8px",
                        "--epr-preview-height": "42px",
                        "--epr-preview-text-size": "11px",
                        "--epr-emoji-padding": "3px",
                        "--epr-emoji-size": "20px",
                      } as CSSProperties}
                      onEmojiClick={(emojiData) => {
                        insertEmoji(emojiData.emoji);
                        setShowEmojiPicker(false);
                      }}
                      lazyLoadEmojis
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
                >
                  Kirim Pengumuman
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#f8f9fa]"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}