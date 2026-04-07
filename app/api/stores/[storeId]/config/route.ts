// app/api/stores/[storeId]/config/route.ts

import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

type Params<T> = { params: Promise<T> };

export async function GET(
     req: NextRequest,
     { params }: Params<{ storeId: string }>
) {
     try {
          const { storeId } = await params;

          const store = await prismadb.store.findUnique({
               where: { id: storeId },
          });

          return NextResponse.json(store);
     } catch (error) {
          console.error("[STORE_CONFIG_GET]", error);
          return new NextResponse("Internal error", { status: 500 });
     }
}

