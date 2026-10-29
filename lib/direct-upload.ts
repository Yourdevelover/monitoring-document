"use client";

export async function uploadFileToSignedUrl(signedUrl: string, file: File) {
  const response = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(result?.message ?? result?.error ?? "Gagal mengirim file ke storage.");
  }
}
