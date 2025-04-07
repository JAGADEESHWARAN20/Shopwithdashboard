// app/api/user/create/route.ts
import { NextResponse, NextRequest } from "next/server";
import { PrismaClient, Role } from "@prisma/client"; // Import Role enum if needed
// Remove: import { getAuth } from "@clerk/nextjs/server"; // No longer needed for this specific route

const prisma = new PrismaClient();

// Define the expected request body type (matches what frontend sends)
interface CreateUserRequest {
     id: string; // This is the Clerk User ID
     email: string;
     name?: string;
     phone?: string;
     address?: string;
     role?: Role; // Use the Prisma Enum Type
     emailVerified?: boolean;
}

export async function POST(request: NextRequest) {
     try {
          // **Removed:** Clerk authentication check (`getAuth`)
          // This endpoint is typically called immediately after Clerk confirms signup
          // on the frontend. It acts as a way to sync user data.
          // Ensure this endpoint isn't exposed in a way that allows arbitrary user creation
          // without going through the Clerk signup flow first.

          // Parse and validate the request body
          let body: CreateUserRequest;
          try {
               body = await request.json();
          } catch (e) {
               return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
          }

          const { id, email, name, phone, address, role, emailVerified } = body;

          // --- Basic Validation ---
          if (!id || !email) {
               return NextResponse.json({ error: "Missing required fields: id and email are required" }, { status: 400 });
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
               return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
          }

          // Validate role if provided (ensure it's a valid value from the enum)
          if (role && !Object.values(Role).includes(role)) {
               return NextResponse.json({ error: `Invalid role. Must be one of: ${Object.values(Role).join(', ')}` }, { status: 400 });
          }
          // --- End Validation ---


          // Check if user already exists by Clerk ID
          const existingUser = await prisma.user.findUnique({
               where: { id }, // Use the Clerk ID as the primary unique identifier
          });

          // Optional: Check if email exists with a *different* ID (if email should be unique across all users)
          const existingEmail = await prisma.user.findUnique({
               where: { email },
          });

          if (existingUser) {
               // User already synced, maybe update? Or just return success?
               // For now, let's return a conflict error to prevent accidental overwrites
               // if called multiple times. Adjust if needed.
               console.warn(`User with ID ${id} already exists.`);
               return NextResponse.json({ message: "User already exists", user: existingUser }, { status: 200 }); // Or 409 Conflict
          }

          if (existingEmail) {
               // Handle case where email is taken but ID doesn't match
               return NextResponse.json({ error: "Email address is already in use by another account." }, { status: 409 });
          }


          // Create the user in Prisma using Clerk ID as the primary ID
          const user = await prisma.user.create({
               data: {
                    id, // Use Clerk's user ID as the primary key
                    email,
                    name: name ?? null, // Use null if name is not provided
                    phone: phone ?? null,
                    address: address ?? null,
                    role: role || Role.CUSTOMER, // Default to CUSTOMER if not provided
                    emailVerified: emailVerified ?? true, // Default to true since Clerk verified it
                    password: `CLERK_AUTH_USER_PLACEHOLDER_${id}`,
               },
          });

          // Return only necessary user fields, avoid sending sensitive data if any
          const { password, ...userWithoutPassword } = user; // Example if password field exists but shouldn't be returned

          return NextResponse.json({ user: userWithoutPassword }, { status: 201 });

     } catch (error: any) {
          console.error("Error creating user:", error);

          // Handle potential Prisma-specific errors
          if (error.code === 'P2002') { // Unique constraint violation
               const target = error.meta?.target;
               if (target?.includes('email')) {
                    return NextResponse.json({ error: "Email address is already in use." }, { status: 409 });
               }
               if (target?.includes('id')) {
                    // This case should ideally be caught by the existingUser check above
                    return NextResponse.json({ error: "User ID already exists." }, { status: 409 });
               }
               return NextResponse.json({ error: "A conflict occurred. Please try again." }, { status: 409 });
          }

          return NextResponse.json({ error: "Internal server error" }, { status: 500 });
     } finally {
          await prisma.$disconnect();
     }
}