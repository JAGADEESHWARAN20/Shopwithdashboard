// app/api/user/profile/route.ts
import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
     try {
          const { userId } = getAuth(request);
          if (!userId) {
               return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
          }

          const user = await prisma.user.findUnique({
               where: { id: userId },
          });

          if (!user) {
               return NextResponse.json({ error: "User not found" }, { status: 404 });
          }

          return NextResponse.json(user);
     } catch (error) {
          console.error("Error fetching user profile:", error);
          return NextResponse.json({ error: "Internal server error" }, { status: 500 });
     } finally {
          await prisma.$disconnect();
     }
}