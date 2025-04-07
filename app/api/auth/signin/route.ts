// app/api/auth/signin/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, Session } from "../../../../types"; // Adjust import path

const prisma = new PrismaClient();

export async function POST(request: Request) {
     try {
          const { email, password } = await request.json();

          // Find the user by email
          const user: User | null = await prisma.user.findUnique({
               where: { email },
          });

          if (!user) {
               return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
          }

          const userId = user.id; // Type narrowing

          // Verify the password
          const isPasswordValid = await bcrypt.compare(password, String(user.password));
          if (!isPasswordValid) {
               return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
          }

          // Create a JWT token
          const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
               expiresIn: "1h",
          });

          // Create a session
          const sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'> = {
               userId: userId,
               token,
               expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          };
          const session: Session = await prisma.session.create({
               data: sessionData,
          });

          const userResponse: Pick<User, 'id' | 'email' | 'name'> = {
               id: user.id,
               email: user.email,
               name: user.name,
          };

          return NextResponse.json({ token, user: userResponse });
     } catch (error) {
          console.error("Error in sign-in:", error);
          return NextResponse.json({ error: "Internal server error" }, { status: 500 });
     } finally {
          await prisma.$disconnect();
     }
}