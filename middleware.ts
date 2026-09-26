import { NextResponse, type NextRequest } from "next/server";

/**
 * Redirect /uploads/... requests to the file-serving API route.
 * This makes file URLs work in production (next start) without
 * relying on public/ static serving, which only works in dev mode.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/uploads/")) {
    return NextResponse.next();
  }

  // Rewrite /uploads/... → /api/files/... so the route handler serves the file
  const apiPath = pathname.replace("/uploads/", "/api/files/uploads/");
  const url = request.nextUrl.clone();
  url.pathname = apiPath;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/uploads/:path*"],
};
