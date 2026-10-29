"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "./components/toast";

function getInternalPath(path: string | null) {
  const url = new URL(path ?? "/", window.location.origin);
  return url.origin === window.location.origin ? `${url.pathname}${url.search}${url.hash}` : "/";
}

export function LoginForm() {
  const router = useRouter();
  const submitting = useRef(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = new URLSearchParams({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body,
        redirect: "manual",
      });
      if (res.type === "opaqueredirect" || res.status === 0) {
        router.replace("/");
        return;
      }
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location") ?? "/";
        router.replace(getInternalPath(loc));
        return;
      }
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = data?.error ?? "Login gagal.";
        setError(msg);
        toast(msg, "error");
        return;
      }
      toast("Login berhasil.", "success");
      router.replace(getInternalPath(data?.redirect ?? "/"));
    } catch {
      const msg = "Tidak dapat terhubung ke server.";
      setError(msg);
      toast(msg, "error");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading}>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          disabled={loading}
          className="w-full rounded-md border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          disabled={loading}
          className="w-full rounded-md border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
        />
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-[#111111] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#333333] active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? "Memproses..." : "Masuk"}
      </button>
      {loading && <p role="status" className="text-center text-xs text-[#6b7280]">Sedang menghubungkan ke server. Jangan klik lagi.</p>}
    </form>
  );
}
