// Import clerkMiddleware from the correct location
import { clerkMiddleware } from '@clerk/nextjs/server';

// Define the middleware function
const middleware = clerkMiddleware();

// Export the middleware function as a named export
export { middleware };

// Export the config for clerkMiddleware
export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],

};
