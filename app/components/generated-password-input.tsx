"use client";

import { useState } from "react";

export function animateShuffleArrows(icon: SVGSVGElement | null) {
  if (!icon) return;
  const currentRotation = Number(icon.dataset.rotation ?? "0");
  const nextRotation = currentRotation - 360;
  icon.dataset.rotation = String(nextRotation);
  icon.style.transform = `rotate(${nextRotation}deg)`;
}

type GeneratedPasswordInputProps = {
  name?: string;
  id?: string;
  required?: boolean;
  className?: string;
  buttonClassName?: string;
};

export function GeneratedPasswordInput({
  name = "password",
  id = "password",
  required = true,
  className,
  buttonClassName,
}: GeneratedPasswordInputProps) {
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [shuffleIcon, setShuffleIcon] = useState<SVGSVGElement | null>(null);

  function generatePassword() {
    const upperBound = Math.floor(0x1_0000_0000 / 1_000_000) * 1_000_000;
    const value = new Uint32Array(1);
    do {
      crypto.getRandomValues(value);
    } while (value[0] >= upperBound);
    setPassword(String(value[0] % 1_000_000).padStart(6, "0"));
    animateShuffleArrows(shuffleIcon);
  }

  return (
    <span className="flex min-w-0 gap-2">
      <input
        id={id}
        name={name}
        type={isVisible ? "text" : "password"}
        placeholder="Password 6 angka"
        value={password}
        onChange={(event) => setPassword(event.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        pattern="[0-9]{6}"
        minLength={6}
        maxLength={6}
        autoComplete="new-password"
        required={required}
        aria-describedby={`${id}-hint`}
        className={className ?? "min-w-0 flex-1 rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"}
      />
      <button
        type="button"
        onClick={() => setIsVisible((visible) => !visible)}
        aria-label={isVisible ? "Sembunyikan password" : "Lihat password"}
        title={isVisible ? "Sembunyikan password" : "Lihat password"}
        aria-pressed={isVisible}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#d1d5db] bg-white text-[#374151] hover:bg-[#f8f9fa]"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {isVisible ? <><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 002.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 8.5 4.5 9.5 7-.4 1-1.3 2.2-2.5 3.3"/><path d="M6.2 6.2C4.3 7.4 3.1 9.3 2.5 12c.5 1.3 1.7 3.2 4.1 4.7A9.8 9.8 0 0012 19c.9 0 1.8-.1 2.6-.4"/></> : <><path d="M2.5 12S5.8 5 12 5s9.5 7 9.5 7-3.3 7-9.5 7-9.5-7-9.5-7z"/><circle cx="12" cy="12" r="3"/></>}
        </svg>
      </button>
      <button
        type="button"
        onClick={generatePassword}
        aria-label="Acak password 6 angka"
        title="Acak password 6 angka"
        className={buttonClassName ?? "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] bg-white hover:bg-[#f8f9fa]"}
      >
        <svg ref={setShuffleIcon} aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5 transition-transform duration-500 ease-in-out" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 13a7 7 0 00-7-7H8m4-4L8 6l4 4" />
          <path d="M5 11a7 7 0 007 7h4m-4-4 4 4-4 4" />
        </svg>
      </button>
      <span id={`${id}-hint`} className="sr-only">Password harus tepat 6 angka.</span>
    </span>
  );
}
