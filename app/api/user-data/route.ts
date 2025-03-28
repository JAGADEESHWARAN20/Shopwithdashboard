// app/api/user-data/route.ts
import { users } from "@clerk/backend";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
     const { userId } = await auth();

     if (!userId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }

     const user = await users.getUser(userId);

     return NextResponse.json(user);
}