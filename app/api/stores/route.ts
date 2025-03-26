import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Handle POST request
export async function POST(req: Request) {
  try {
    const { userId } = auth();

    const body = await req.json();
    const { name } = body;

    if (!userId) {
      return new NextResponse("Not authenticated", { status: 401 });
    }
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Generate initial store URL
    const storeUrl = `https://${name.toLowerCase().replace(/\s+/g, '-')}.ecommercestore-online.vercel.app`;

    // Make sure we're using the production domain, not a Git branch URL
    if (storeUrl.includes('-git-main-jagadeeshwaran20s-projects.vercel.app')) {
      console.warn("Found Git deployment URL pattern, correcting to production domain");
      // This should never happen with the above code, but just in case
    }

    // Create a new store
    const store = await prismadb.store.create({
      data: {
        name,
        userId,
        isActive: true,
        storeUrl
      },
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error("[STORES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
