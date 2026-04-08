// app/api/stores/[storeId]/billboards/route.ts
import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

type Params<T> = { params: Promise<T> };

export async function GET(
     req: NextRequest,
     { params }: Params<{ storeId: string }>
) {
     try {
          const { storeId } = await params;

          const billboards = await prismadb.billboard.findMany({
               where: { storeId: storeId },
          });

          return NextResponse.json(billboards);
     } catch (error) {
          console.error("[STORE_BILLBOARDS_GET]", error);
          return new NextResponse("Internal error", { status: 500 });
     }
}