// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

// Define route patterns
const publicRoutes = [
  "/auth/login",
  "/auth/register", 
  "/auth/error",
  "/api/auth"
];

const adminRoutes = [
  "/operators/new",
  "/operators/[id]/edit", // if you have edit routes
  "/contracts/new",
  "/contracts/[id]/edit", // if you have edit routes
  "/admin" // any other admin routes
];

const protectedRoutes = [
  "/dashboard",
  "/complaints",
  "/contracts", 
  "/operators",
  "/settings",
  "/api/complaints",
  "/api/contracts",
  "/api/operators"
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname.startsWith(route));
}

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some(route => {
    // Handle dynamic routes like /operators/[id]/edit
    if (route.includes('[id]')) {
      const pattern = route.replace('[id]', '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(pathname);
    }
    return pathname.startsWith(route);
  });
}

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

// Helper function to get user role from database
async function getUserRoleFromDB(userId: string) {
  // This should only be used as a fallback when role is not in session
  // In production, the role should always be in the session
  console.warn("[MIDDLEWARE] Fallback: Role not found in session, this should not happen in production");
  return null; // Return null to deny access if role is not in session
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log("[MIDDLEWARE] Processing request:", { pathname });

  // Allow public routes
  if (isPublicRoute(pathname)) {
    console.log("[MIDDLEWARE] Public route, allowing access");
    return NextResponse.next();
  }

  // Get session
  const session = await auth();
  const isLoggedIn = !!session?.user;

  console.log("[MIDDLEWARE] Session check:", { 
    isLoggedIn, 
    userEmail: session?.user?.email,
    userId: session?.user?.id 
  });

  // Redirect to login if not authenticated and trying to access protected routes
  if (!isLoggedIn && (isProtectedRoute(pathname) || isAdminRoute(pathname))) {
    console.log("[MIDDLEWARE] Not logged in, redirecting to login");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // For admin routes, we need to check the user's role
  if (isAdminRoute(pathname) && isLoggedIn) {
    let userRole = null;
    
    // Try to get role from session first
    if (session?.user && 'role' in session.user) {
      userRole = (session.user as any).role;
      console.log("[MIDDLEWARE] Got role from session:", userRole);
    } else if (session?.user?.id) {
      // Fallback: should not happen with proper auth setup
      console.log("[MIDDLEWARE] Role not in session - denying access");
      userRole = null; // Force denial if role is not in session
    }

    const isAdmin = userRole === 'ADMIN';
    const isManager = userRole === 'MANAGER';
    const hasAdminAccess = isAdmin || isManager;

    console.log("[MIDDLEWARE] Admin route check:", {
      pathname,
      userRole,
      isAdmin,
      isManager,
      hasAdminAccess
    });

    if (!hasAdminAccess) {
      console.log("[MIDDLEWARE] Admin route access denied, redirecting to dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  console.log("[MIDDLEWARE] Access granted");
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};