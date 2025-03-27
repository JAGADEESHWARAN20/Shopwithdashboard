import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

// POST route (for creating a new store)
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

    // Generate unique storeUrl using ecommercestore-online.vercel.app
    const storeUrl = `https://${name.toLowerCase().replace(/\s+/g, '-')}-ecommercestore-online.vercel.app`;

    const store = await prismadb.store.create({
      data: {
        name,
        userId,
        isActive: true,
        storeUrl,
      },
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error("[STORES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// GET route (for fetching stores for the current user)
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return new NextResponse("Not authenticated", { status: 401 });
    }

    const stores = await prismadb.store.findMany({
      where: {
        userId,
      },
    });

    return NextResponse.json(stores, { status: 200 });
  } catch (error) {
    console.error("[STORES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}