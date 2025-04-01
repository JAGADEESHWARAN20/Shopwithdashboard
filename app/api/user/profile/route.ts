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

          return NextResponse.json({
               id: user.id,
               email: user.email,
               name: user.name,
               phone: user.phone,
               address: user.address,
               image: user.image,
               role: user.role,
          });
     } catch (error) {
          console.error("Error fetching profile:", error);
          return NextResponse.json({ error: "Internal server error" }, { status: 500 });
     }
}

export async function PATCH(request: NextRequest) {
     try {
          const { userId } = getAuth(request);
          if (!userId) {
               return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
          }

          const data = await request.json();
          const { name, phone, address, image } = data;

          const updatedUser = await prisma.user.update({
               where: { id: userId },
               data: {
                    name,
                    phone,
                    address,
                    image,
               },
          });

          return NextResponse.json({
               user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    name: updatedUser.name,
                    phone: updatedUser.phone,
                    address: updatedUser.address,
                    image: updatedUser.image,
                    role: updatedUser.role,
               },
          });
     } catch (error) {
          console.error("Error updating profile:", error);
          return NextResponse.json({ error: "Internal server error" }, { status: 500 });
     }
}