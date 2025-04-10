import { authMiddleware } from "@clerk/nextjs";

export const clerkAuthMiddleware = authMiddleware({
  publicRoutes: ["/sign-in", "/sign-up", "/api/public(.*)"],
});
