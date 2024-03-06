import { authMiddleware } from "@clerk/nextjs";

// Configure the public and ignored routes as needed
export default authMiddleware({
  // Define the routes that can be accessed while signed out
  publicRoutes: [
    "/",
    "/about",
    // Add more public routes here as needed
  ],
  // Define routes that should be ignored by the authentication middleware
  ignoredRoutes: [
    // Add routes that should be ignored here
  ],
});

// Configure the matcher to protect all routes except the public ones
export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)"],
};
