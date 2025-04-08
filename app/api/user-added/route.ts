import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
     try {
          const { userId, name } = await req.json();

          if (!userId || !name) {
               return NextResponse.json({ error: "Missing userId or name." }, { status: 400 });
          }

          const updatedUser = await prisma.user.update({
               where: {
                    id: userId, // Matching against the Clerk User ID
               },
               data: {
                    name: name,
               },
          });

          return NextResponse.json({ message: "User details updated successfully!", user: updatedUser }, { status: 200 });
     } catch (error: any) {
          console.error("Error updating user details:", error);
          return NextResponse.json({ error: "Failed to update user details." }, { status: 500 });
     } finally {
          await prisma.$disconnect();
     }
}