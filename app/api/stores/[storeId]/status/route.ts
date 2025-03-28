// app/api/stores/[storeId]/status/route.ts

import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getAuth } from "@clerk/nextjs/server";

export async function PATCH(req: NextRequest, { params }: { params: { storeId: string } }) {
     try {
          const { userId } = getAuth(req);
          const { storeId } = params;
          const body = await req.json();
          const { isActive } = body;

          if (!userId) {
               return new NextResponse("Unauthorized", { status: 401 });
          }

          if (!storeId) {
               return new NextResponse("Store ID is required", { status: 400 });
          }

          if (typeof isActive !== 'boolean') {
               return new NextResponse("isActive must be a boolean", { status: 400 });
          }

          const store = await prismadb.store.updateMany({
               where: {
                    id: storeId,
                    userId: userId,
               },
               data: {
                    isActive: isActive,
               },
          });

          return NextResponse.json(store);
     } catch (error) {
          console.error("[STORE_STATUS_PATCH]", error);
          return new NextResponse("Internal error", { status: 500 });
     }
}