// app/api/stores/[storeId]/billboards/route.ts
import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
     req: NextRequest,
     { params }: { params: { storeId: string } }
) {
     try {
          const { storeId } = params;

          const billboards = await prismadb.billboard.findMany({
               where: { storeId: storeId },
          });

          return NextResponse.json(billboards);
     } catch (error) {
          console.error("[STORE_BILLBOARDS_GET]", error);
          return new NextResponse("Internal error", { status: 500 });
     }
}