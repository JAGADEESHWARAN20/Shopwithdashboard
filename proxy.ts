import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCorsHeaders } from "@/lib/api-utils";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/(.*)",
  "/_next/(.*)", // ✅ allow Next internals
  "/favicon.ico",
]);

export default clerkMiddleware((auth, request) => {
  const origin = request.headers.get("origin");

  // ✅ Allow Clerk internal routes explicitly
  if (request.nextUrl.pathname.includes("SignUp_clerk_catchall_check")) {
    return NextResponse.next();
  }

  // ✅ Preflight
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }

  if (!isPublicRoute(request)) {
    auth.protect();
  }

  const response = NextResponse.next();
  const corsHeaders = getCorsHeaders(origin);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};