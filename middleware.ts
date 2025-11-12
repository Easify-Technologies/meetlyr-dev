import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_ROUTES = ["/bookings", "/settings", "/payment", "/events", "/personal-information"];
const GUEST_ROUTES = ["/login", "/get-started", "/email-verification", "/forgot-password", "/verify-otp", "/reset-password"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // ✅ Redirect unauthenticated users trying to access protected routes
  if (
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) &&
    !token
  ) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // ✅ Redirect logged-in users trying to access guest-only routes
  if (
    GUEST_ROUTES.some((route) => pathname.startsWith(route)) &&
    token
  ) {
    return NextResponse.redirect(new URL("/bookings", req.url));
  }

  // Otherwise, allow the request
  return NextResponse.next();
}

// ✅ Define which routes should trigger middleware
export const config = {
  matcher: [
    "/bookings/:path*",
    "/settings/:path*",
    "/payment/:path*",
    "/events/:path*",
    "/login",
    "/get-started/:path*",
  ],
};
