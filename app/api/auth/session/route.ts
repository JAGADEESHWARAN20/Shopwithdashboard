// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
     try {
          const token = request.headers.get("authorization")?.replace("Bearer ", "");
          if (!token) {
               return NextResponse.json({ error: "No token provided" }, { status: 401 });
          }

          // Verify token
          const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { userId: string };
          const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

          if (!user) {
               return NextResponse.json({ error: "User not found" }, { status: 404 });
          }

          return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
     } catch (error) {
          console.error("Session error:", error);
          return NextResponse.json({ error: "Invalid token" }, { status: 401 });
     }
}