import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
     try {
          const { userId, name, email } = await req.json();

          if (!userId || !email) { // Email is now required
               return NextResponse.json({ error: "Missing userId or email." }, { status: 400 });
          }

          const existingUser = await prisma.user.findUnique({
               where: {
                    id: userId,
               },
          });

          if (!existingUser) {
               // Create a new user
               const newUser = await prisma.user.create({
                    data: {
                         id: userId,
                         name: name || null,
                         email: email,
                         password: 'google_sign_in', // Placeholder password for Google users
                         emailVerified: true, // Assuming Google sign-in verifies email
                         // You might want to add other initial user data here
                    },
               });
               return NextResponse.json({ message: "New user created!", user: newUser }, { status: 201 });
          } else {
               // Update the existing user's name
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
          console.error("Error handling user details:", error);
          return NextResponse.json({ error: "Failed to handle user details." }, { status: 500 });
     } finally {
          await prisma.$disconnect();
     }
}