// app/api/post-userdetails/route.ts
import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";


export async function POST(req: NextRequest) {



     try {
          const json = await req.json();
          const { userId, name, email } = json;

          if (!userId || !email) {
               return NextResponse.json({ error: "Missing userId or email." }, { status: 400 });
          }

          const existingUser = await prismadb.user.findUnique({ where: { id: userId } });
          console.log(existingUser );

          if (!existingUser) {
               const newUser = await prismadb.user.create({
                    data: {
                         id: userId,
                         name: name || null,
                         email,
                         password: "oauth_placeholder", 
                         emailVerified: true,
                    },
               });
               console.log(newUser);
               return NextResponse.json({ message: "New user created!", user: newUser }, { status: 201 });
          } else {
               const updatedUser = await prismadb.user.update({
                    where: { id: userId },
                    data: { name },
               });
               return NextResponse.json({ message: "User details updated successfully!", user: updatedUser }, { status: 200 });
          }
     } catch (error: any) {
          console.error("Error in POST /post-userdetails:", error);
          return NextResponse.json({ error: "Failed to handle user details." }, { status: 500 });
     }
}