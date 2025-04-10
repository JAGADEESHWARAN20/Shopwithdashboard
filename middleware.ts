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

export const config = {
  matcher: [
    "/((?!_next|.*\\.(?:svg|png|jpg|jpeg|ico|css|js|woff|woff2)).*)",
    "/(api|trpc)(.*)",
    "/:storeId/orders(.*)",
  ],
};
