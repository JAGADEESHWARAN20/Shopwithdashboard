<<<<<<< HEAD
<<<<<<<< HEAD:proxy.ts
=======
>>>>>>> codex/create-api-for-adding-designs-to-collection-waqk9m
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCorsHeaders } from "@/lib/api-utils";

<<<<<<< HEAD
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/(.*)",
  "/_next/(.*)", // ✅ allow Next internals
  "/favicon.ico",
]);
=======
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/api/(.*)"]);
>>>>>>> codex/create-api-for-adding-designs-to-collection-waqk9m

export default clerkMiddleware((auth, request) => {
  const origin = request.headers.get("origin");

<<<<<<< HEAD
  // ✅ Allow Clerk internal routes explicitly
  if (request.nextUrl.pathname.includes("SignUp_clerk_catchall_check")) {
    return NextResponse.next();
  }

  // ✅ Preflight
=======
>>>>>>> codex/create-api-for-adding-designs-to-collection-waqk9m
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
<<<<<<< HEAD
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
========
// Backward-compatible entrypoint for Next.js <=15.
// Keeps support while proxy.ts is used by newer Next.js versions.
export { default, config } from "./proxy";
>>>>>>>> codex/create-api-for-adding-designs-to-collection-waqk9m:middleware.ts
=======
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
>>>>>>> codex/create-api-for-adding-designs-to-collection-waqk9m
