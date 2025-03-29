import { createClerkClient } from "@clerk/backend";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Instantiate clerkClient with your secret key
const clerkClient = createClerkClient({
     secretKey: process.env.CLERK_SECRET_KEY,
});

export async function GET(req: Request) {
     const { userId } = await auth();

     if (!userId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }

     // Use clerkClient.users.getUser() instead of users.getUser()
     const user = await clerkClient.users.getUser(userId);

     return NextResponse.json(user);
}