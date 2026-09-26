"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "./components/toast";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: formData,
        redirect: "manual",
      });
      if (res.type === "opaqueredirect" || res.status === 0) {
        router.refresh();
        window.location.href = "/";
        return;
      }
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location") ?? "/";
        window.location.href = loc;
        return;
      }
      const data = await res.json().catch(() => null);
      console.log("Login response:", data);
      if (!res.ok) {
        const msg = data?.error ?? "Login gagal.";
        setError(msg);
        toast(msg, "error");
        return;
      }
      toast("Login berhasil.", "success");
      window.location.href = data?.redirect ?? "/";
    } catch {
      const msg = "Tidak dapat terhubung ke server.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue="admin@monitoring.local"
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
          defaultValue="admin"
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
    </form>
  );
}
