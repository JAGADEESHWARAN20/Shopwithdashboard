import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

// Function to check if the origin ends with the allowed domain
function isAllowedOrigin(origin: string | null): boolean {
     if (!origin) {
          return false;
     }
     return origin?.endsWith("ecommercestore-online.vercel.app") || false;
}

export async function POST(req: NextRequest) {
     try {
          const origin = req.headers.get("origin");

          if (origin && isAllowedOrigin(origin)) {
               // Set CORS headers for allowed origin
               const response = await processPostRequest(req); // Your original logic
               response.headers.set("Access-Control-Allow-Origin", origin);
               response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS"); // Adjust as needed
               response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Adjust as needed
               return response;
          } else {
               return new NextResponse(
                    JSON.stringify({ error: "CORS: Origin not allowed." }),
                    {
                         status: 403,
                         headers: {
                              "Content-Type": "application/json",
                         },
                    }
               );
          }
     } catch (error: any) {
          console.error("Error handling user details:", error);
          return NextResponse.json({ error: "Failed to handle user details." }, { status: 500 });
     } finally {
          await prisma.$disconnect();
     }
}

async function processPostRequest(req: NextRequest) {
     try {
          const { userId, name, email } = await req.json();

          if (!userId || !email) {
               return NextResponse.json({ error: "Missing userId or email." }, { status: 400 });
          }

          const existingUser = await prisma.user.findUnique({
               where: {
                    id: userId,
               },
          });

          if (!existingUser) {
               const newUser = await prisma.user.create({
                    data: {
                         id: userId,
                         name: name || null,
                         email: email,
                         password: 'google_sign_in', // Placeholder password for Google users
                         emailVerified: true, // Assuming Google sign-in verifies email
                    },
               });
               return NextResponse.json({ message: "New user created!", user: newUser }, { status: 201 });
          } else {
               const updatedUser = await prisma.user.update({
                    where: {
                         id: userId,
                    },
                    data: {
                         name: name,
                    },
               });
               return NextResponse.json({ message: "User details updated successfully!", user: updatedUser }, { status: 200 });
          }
     } catch (error: any) {
          console.error("Error in processPostRequest:", error);
          return NextResponse.json({ error: "Failed to process user request." }, { status: 500 });
     }
}

// Handle OPTIONS request for preflight
export async function OPTIONS(req: NextRequest) {
     const origin = req.headers.get("origin");

     if (origin && isAllowedOrigin(origin)) {
          return new NextResponse(null, {
               status: 204,
               headers: {
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Methods": "POST, OPTIONS", // Adjust as needed
                    "Access-Control-Allow-Headers": "Content-Type, Authorization", // Adjust as needed
                    "Access-Control-Max-Age": "86400", // Optional: How long the preflight response can be cached (in seconds)
               },
          });
     } else {
          return new NextResponse(
               JSON.stringify({ error: "CORS: Origin not allowed." }),
               {
                    status: 403,
                    headers: {
                         "Content-Type": "application/json",
                    },
               }
          );
     }
}