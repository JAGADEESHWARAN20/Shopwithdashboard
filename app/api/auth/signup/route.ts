// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(request: Request) {
     try {
          const { email, password, name } = await request.json();

          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
               where: { email },
          });
          if (existingUser) {
               return NextResponse.json({ error: "User already exists" }, { status: 400 });
          }

          // Hash the password
          const hashedPassword = await bcrypt.hash(password, 10);

          // Create the user
          const user = await prisma.user.create({
               data: {
                    email,
                    password: hashedPassword,
                    name,
               },
          });

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
          console.error("Error in sign-up:", error);
          return NextResponse.json({ error: "Internal server error" }, { status: 500 });
     }
}