// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authMiddlewareSafe } from "@/auth";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  const session = await authMiddlewareSafe(req);
  const isLoggedIn = !!session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";

  const protectedPaths = ["/admin", "/dashboard"];
  const adminOnlyPaths = ["/admin"];

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAdminOnly = adminOnlyPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !isLoggedIn) {
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (isAdminOnly && !isAdmin) {
    url.pathname = "/403";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
