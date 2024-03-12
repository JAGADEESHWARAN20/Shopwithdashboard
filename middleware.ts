// File: middleware.ts
import { authMiddleware } from "@clerk/nextjs";

const middleware = authMiddleware({
  // If the .env based settings for the sign-in and sign-up routes are present,
  // add the sign-in and sign-up routes to any routes listed in publicRoutes.
  // If the .env based settings are not present, add /sign-in and /sign-up
  // to any routes listed in publicRoutes.
  publicRoutes: [process.env.SIGN_IN_ROUTE ?? '/sign-in', process.env.SIGN_UP_ROUTE ?? '/sign-up'],
  // No routes are ignored
  ignoredRoutes: [],
});

export default middleware;

export const config = {
  // Make all routes from publicRoutes public.
  // Make all remaining routes protected.
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)"],
};
