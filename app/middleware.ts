import { NextRequest } from "next/server";
import { corsMiddleware } from "@/lib/middleware/cors";
import { clerkAuthMiddleware } from "@/lib/middleware/clerk";

// Main Next.js Middleware
export function middleware(req: NextRequest) {
  // 1. Apply CORS logic
  const cors = corsMiddleware(req);
  if (cors) return cors;

  // 2. Then apply Clerk auth
  return clerkAuthMiddleware(req);
}

export const config = {
  matcher: [
    // Apply to all API routes and relevant app routes
    "/((?!_next|.*\\.(?:svg|png|jpg|jpeg|ico|css|js)).*)",
    "/(api|trpc)(.*)",
    "/:storeId/orders(.*)",
  ],
};
