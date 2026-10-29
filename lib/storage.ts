import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "monitoring-files";
let storageClient: SupabaseClient | undefined;

class StorageConfigurationError extends Error {
  constructor() {
    super("Supabase Storage is not configured.");
    this.name = "StorageConfigurationError";
  }
}

export function getStorageFailureMessage(error: unknown) {
  if (!(error instanceof Error)) return null;

  if (error instanceof StorageConfigurationError) {
    return "Konfigurasi Supabase Storage belum lengkap di Vercel. Atur SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY, lalu deploy ulang.";
  }

  if (error.name === "StorageApiError" || error.name === "StorageError") {
    return `Supabase Storage menolak unggahan: ${error.message}`;
  }

  if (error.name === "TypeError" && /fetch|network|failed/i.test(error.message)) {
    return "Server tidak dapat menghubungi Supabase Storage. Periksa URL Supabase dan status project.";
  }

  return null;
}

function getStorageClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new StorageConfigurationError();
  }

  storageClient ??= createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return storageClient.storage.from(BUCKET);
}

function getObjectPath(filePath: string) {
  const objectPath = filePath.replace(/^\/?uploads\//, "");
  if (!objectPath || objectPath.split("/").some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error("Invalid storage path.");
  }
  return objectPath;
}

export async function uploadStoredFile(filePath: string, data: Uint8Array, contentType: string) {
  const { error } = await getStorageClient().upload(getObjectPath(filePath), data, {
    contentType,
    upsert: false,
  });
  if (error) throw error;
}

export async function createSignedUpload(filePath: string) {
  const { data, error } = await getStorageClient().createSignedUploadUrl(getObjectPath(filePath));
  if (error) throw error;

  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error("Supabase Storage is not configured.");
  const signedUrl = data.signedUrl.startsWith("http")
    ? data.signedUrl
    : new URL(
        data.signedUrl.startsWith("/storage/v1/")
          ? data.signedUrl
          : `/storage/v1/${data.signedUrl.replace(/^\/+/, "")}`,
        url
      ).toString();

  return {
    path: filePath,
    token: data.token,
    signedUrl,
  };
}

export async function verifyStoredFile(filePath: string, expectedSize: number) {
  const { data, error } = await getStorageClient().info(getObjectPath(filePath));
  if (error) throw error;
  if (data.size !== expectedSize) throw new Error("Ukuran berkas di storage tidak sesuai.");
  return data;
}

export async function createSignedDownloadUrl(filePath: string, fileName: string) {
  const { data, error } = await getStorageClient().createSignedUrl(
    getObjectPath(filePath),
    60,
    fileName ? { download: fileName } : undefined
  );
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteStoredFile(filePath: string) {
  const { error } = await getStorageClient().remove([getObjectPath(filePath)]);
  if (error) throw error;
}

export async function copyStoredFile(sourcePath: string, destinationPath: string) {
  const bucket = getStorageClient();
  const source = getObjectPath(sourcePath);
  const destination = getObjectPath(destinationPath);
  const { error } = await bucket.copy(source, destination);
  if (error) throw error;
}

export async function downloadStoredFile(filePath: string) {
  const { data, error } = await getStorageClient().download(getObjectPath(filePath));
  if (error) throw error;
  return Buffer.from(await data.arrayBuffer());
}