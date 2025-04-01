// app/api/auth/signin/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(request: Request) {
     try {
          const { email, password } = await request.json();

          // Find the user by email
          const user = await prisma.user.findUnique({
               where: { email },
          });

          if (!user || !user.password) {
               return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
          }

          // Verify the password
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
               return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
          }

          // Create a JWT token
          const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
               expiresIn: "1h",
          });

          // Create a session
          await prisma.session.create({
               data: {
                    userId: user.id,
                    token,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
               },
          });

          return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name } });
     } catch (error) {
          console.error("Error in sign-in:", error);
          return NextResponse.json({ error: "Internal server error" }, { status: 500 });
     }
}