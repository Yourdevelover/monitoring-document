export function getBaseUrl(request: Request): string {
  const host = request.headers.get("host") ?? "localhost:3000";
  const safeHost = host.replace(/^0\.0\.0\.0/, "localhost");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${safeHost}`;
}
