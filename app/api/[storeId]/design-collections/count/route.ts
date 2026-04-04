// app/api/[storeId]/design-collections/count/route.ts
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const count = await prismadb.designCollection.count({
      where: {
        storeId: params.storeId,
      },
    });

    return NextResponse.json(count);
  } catch (error) {
    console.error('[COUNT_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}