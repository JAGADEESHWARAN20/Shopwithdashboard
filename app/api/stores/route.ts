import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return new NextResponse("Not authenticated", { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Generate storeUrl (if needed)
    const storeUrl = `${process.env.NEXT_PUBLIC_APP_DOMAIN}`;

    const store = await prismadb.store.create({
      data: {
        name,
        userId,
        isActive: true, // Add isActive if needed
        storeUrl, // Add storeUrl if needed
      },
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error("[STORES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}