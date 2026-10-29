"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "./toast";
import { LoadingIndicator } from "./loading-indicator";

type ApiFormProps = {
  action: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  className?: string;
  id?: string;
  children: ReactNode;
  successMessage?: string;
  confirmMessage?: string;
};

export function ApiForm({
  action,
  method = "POST",
  className,
  id,
  children,
  successMessage = "Perubahan berhasil disimpan.",
  confirmMessage,
}: ApiFormProps) {
  const submitting = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (confirmMessage && !window.confirm(confirmMessage)) return;

    submitting.current = true;
    setIsSubmitting(true);
    const form = event.currentTarget;

    try {
      const formData = new FormData(form);
      const requestUrl = new URL(action, window.location.origin);
      if (method === "GET") {
        formData.forEach((value, key) => requestUrl.searchParams.append(key, String(value)));
      }
      const response = await fetch(method === "GET" ? requestUrl.toString() : action, {
        method,
        body: method === "GET" ? undefined : formData,
        redirect: "follow",
      });

      if (response.redirected) {
        window.location.assign(response.url);
        return;
      }

      const contentType = response.headers.get("content-type") ?? "";
      const result = contentType.includes("application/json")
        ? await response.json().catch(() => null)
        : null;

      if (!response.ok || result?.success === false) {
        throw new Error(result?.error ?? result?.message ?? `Permintaan gagal (HTTP ${response.status}).`);
      }

      toast(result?.message ?? successMessage, "success");
      window.location.reload();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.";
      toast(message, "error");
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form id={id} action={action} method={method} className={className} onSubmit={handleSubmit} aria-busy={isSubmitting}>
      <fieldset disabled={isSubmitting} className="contents">
        {children}
      </fieldset>
      {isSubmitting && <LoadingIndicator label="Menyimpan, mohon tunggu..." className="mt-2 text-xs text-[#6b7280]" />}
    </form>
  );
}
