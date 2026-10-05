export const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024;
export const MAX_UPLOAD_REQUEST_SIZE_BYTES = MAX_UPLOAD_SIZE_BYTES + 1024 * 1024;

export function exceedsUploadRequestLimit(request: Request) {
  const contentLength = Number(request.headers.get("content-length"));
  return Number.isFinite(contentLength) && contentLength > MAX_UPLOAD_REQUEST_SIZE_BYTES;
}