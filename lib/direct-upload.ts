"use client";

export async function uploadFileToSignedUrl(signedUrl: string, file: File) {
  let response: Response;
  try {
    response = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
  } catch {
    throw new Error("Koneksi browser ke Supabase Storage gagal. Periksa CORS bucket agar mengizinkan domain aplikasi Vercel.");
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    let message = "";
    try {
      const result = JSON.parse(body) as { message?: string; error?: string; error_description?: string };
      message = result.message ?? result.error_description ?? result.error ?? "";
    } catch {
      message = body;
    }
    throw new Error(message ? `Supabase Storage (${response.status}): ${message}` : `Supabase Storage menolak unggahan (HTTP ${response.status}).`);
  }
}
