<<<<<<< Updated upstream
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/api/:path*'])

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect()
  }
})
=======
import { NextRequest } from "next/server";
import { corsMiddleware } from "@/lib/middleware/cors";
import { clerkAuthMiddleware } from "@/lib/middleware/clerk";

export function middleware(req: NextRequest) {
  // CORS check (first)
  const cors = corsMiddleware(req);
  if (cors) return cors;

  // Clerk authentication
  return clerkAuthMiddleware(req);
}
>>>>>>> Stashed changes

export const config = {
  matcher: [
    "/((?!_next|.*\\.(?:svg|png|jpg|jpeg|ico|css|js|woff|woff2)).*)",
    "/(api|trpc)(.*)",
    "/:storeId/orders(.*)",
  ],
};
