import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

// ================= POST BILLBOARD =================
export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ storeId: string }>;
  }
) {
<<<<<<< HEAD
<<<<<<< HEAD
    try {
        // Ensure user is authenticated
        const { userId } =await auth();

        const body = await req.json();
        const { label, imageUrl } = body;
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
=======
  try {
    const { storeId } = await params;
    const { userId } = await auth();
>>>>>>> 95f3d2a (new update)
=======
  try {
    const { storeId } = await params;
    const { userId } = await auth();
>>>>>>> 95f3d2a (new update)

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const body = await req.json();
    const { label, imageUrl } = body;

    if (!label) {
      return new NextResponse("Label is required", { status: 400 });
    }

    if (!imageUrl) {
      return new NextResponse("ImageUrl is required", { status: 400 });
    }

    const store = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });

    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const billboard = await prismadb.billboard.create({
      data: {
        label,
        imageUrl,
        storeId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.error("[BILLBOARDS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// ================= GET BILLBOARDS =================
export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ storeId: string }>;
  }
) {
  try {
    const { storeId } = await params;

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const billboards = await prismadb.billboard.findMany({
      where: {
        storeId,
      },
    });

    return NextResponse.json(billboards);
  } catch (error) {
    console.error("[BILLBOARDS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}