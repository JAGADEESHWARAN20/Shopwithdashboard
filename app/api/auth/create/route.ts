// app/api/user/create/route.ts
import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// Define the expected request body type
interface CreateUserRequest {
     id: string;
     email: string;
     name?: string;
     phone?: string;
     address?: string;
     role?: "ADMIN" | "CUSTOMER";
     emailVerified?: boolean;
}

export async function POST(request: NextRequest) {
     try {
          // Authenticate the request using Clerk
          const { userId } = getAuth(request);
          if (!userId) {
               return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
          }

          // Parse and validate the request body
          const body: CreateUserRequest = await request.json();
          const { id, email, name, phone, address, role, emailVerified } = body;

          // Validate required fields
          if (!id || !email) {
               return NextResponse.json({ error: "Missing required fields: id and email are required" }, { status: 400 });
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
               return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
          }

          // Validate role if provided
          if (role && !["ADMIN", "CUSTOMER"].includes(role)) {
               return NextResponse.json({ error: "Invalid role. Must be 'ADMIN' or 'CUSTOMER'" }, { status: 400 });
          }

          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
               where: { id },
          });

          if (existingUser) {
               return NextResponse.json({ error: "User already exists" }, { status: 409 });
          }

          // Create the user in Prisma
          const user = await prisma.user.create({
               data: {
                    id,
                    email,
                    name,
                    phone,
                    address,
                    role: role || "CUSTOMER",
                    emailVerified: emailVerified ?? false, // Use nullish coalescing for better type safety
               },
          });

          return NextResponse.json({ user }, { status: 201 });
     } catch (error) {
          console.error("Error creating user:", error);
          return NextResponse.json({ error: "Internal server error" }, { status: 500 });
     } finally {
          await prisma.$disconnect();
     }
}