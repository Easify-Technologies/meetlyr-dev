import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_ROUTES = [
  "/bookings",
  "/settings",
  "/payment",
  "/connect",
  "/events",
  "/personal-information",
];

const GUEST_ROUTES = [
  "/",
  "/login",
  "/get-started",
  "/email-verification",
  "/forgot-password",
  "/verify-otp", // special handling below
  "/reset-password",
];

function isGuestRoute(pathname: string) {
  return GUEST_ROUTES.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname.startsWith(route);
  });
}

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 1. Protected routes → must be logged in
  if (isProtectedRoute(pathname) && !token) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Allow /verify-otp always (whether logged in or not)
  if (pathname.startsWith("/verify-otp")) {
    return NextResponse.next();
  }

  // 3. Logged-in user cannot access guest pages
  if (isGuestRoute(pathname) && token) {
    return NextResponse.redirect(new URL("/bookings", req.url));
  }

  return NextResponse.next();
}

// ROUTES WHERE MIDDLEWARE SHOULD RUN
export const config = {
  matcher: [
    "/",
    "/bookings/:path*",
    "/settings/:path*",
    "/payment/:path*",
    "/events/:path*",
    "/personal-information/:path*",
    "/login",
    "/get-started/:path*",
    "/email-verification",
    "/forgot-password",
    "/verify-otp",
    "/reset-password",
  ],
};
