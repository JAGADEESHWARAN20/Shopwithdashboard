// app/api/[storeId]/design-collections/count/route.ts
import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

type Params<T> = { params: Promise<T> };

export async function GET(
  req: NextRequest,
  { params }: Params<{ storeId: string }>
) {
  try {
    const { storeId } = await params; // ✅ FIX

    if (!storeId) {
      return new NextResponse("StoreId is required", { status: 400 });
    }

    const count = await prismadb.designCollection.count({
      where: {
        storeId,
      },
    });

    return NextResponse.json(count);
  } catch (error) {
    console.error("[COUNT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
