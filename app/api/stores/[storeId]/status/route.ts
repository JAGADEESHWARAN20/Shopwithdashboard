// app/api/stores/[storeId]/status/route.ts

import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

type Params<T> = { params: Promise<T> };

export async function PATCH(
  req: NextRequest,
  { params }: Params<{ storeId: string }>
) {
  try {
    const { userId } = await auth(); // ✅ FIXED

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { storeId } = await params;

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const body = await req.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return new NextResponse("isActive must be a boolean", { status: 400 });
    }

    const store = await prismadb.store.updateMany({
      where: {
        id: storeId,
        userId,
      },
      data: {
        isActive,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.error("[STORE_STATUS_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}