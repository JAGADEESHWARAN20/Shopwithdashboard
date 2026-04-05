import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCorsHeaders } from "@/lib/api-utils";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/api/(.*)"]);

export default clerkMiddleware((auth, request) => {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }

  if (!isPublicRoute(request)) {
    auth().protect();
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
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
