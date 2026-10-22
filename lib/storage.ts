import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "monitoring-files";
let storageClient: SupabaseClient | undefined;

function getStorageClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase Storage is not configured.");
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

export async function deleteStoredFile(filePath: string) {
  const { error } = await getStorageClient().remove([getObjectPath(filePath)]);
  if (error) throw error;
}

export async function copyStoredFile(sourcePath: string, destinationPath: string) {
  const bucket = getStorageClient();
  const source = getObjectPath(sourcePath);
  const destination = getObjectPath(destinationPath);
  const { data, error } = await bucket.download(source);
  if (error) throw error;

  const { error: uploadError } = await bucket.upload(destination, new Uint8Array(await data.arrayBuffer()), {
    contentType: data.type || "application/octet-stream",
    upsert: false,
  });
  if (uploadError) throw uploadError;
}

export async function downloadStoredFile(filePath: string) {
  const { data, error } = await getStorageClient().download(getObjectPath(filePath));
  if (error) throw error;
  return Buffer.from(await data.arrayBuffer());
}