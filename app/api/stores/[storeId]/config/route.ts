// app/api/stores/[storeId]/config/route.ts

import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
     req: NextRequest,
     { params }: { params: { storeId: string } }
) {
     try {
          const { storeId } = params;

          const store = await prismadb.store.findUnique({
               where: { id: storeId },
          });

          return NextResponse.json(store);
     } catch (error) {
          console.error("[STORE_CONFIG_GET]", error);
          return new NextResponse("Internal error", { status: 500 });
     }
}

