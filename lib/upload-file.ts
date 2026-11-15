export function getUploadFileName(filePath: string): string {
  const fileName = filePath.split(/[\\/]/).pop() || "berkas";
  return fileName.replace(/^\d+-/, "") || fileName;
}