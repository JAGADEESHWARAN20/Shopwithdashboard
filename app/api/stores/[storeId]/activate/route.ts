import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
     req: Request,
     { params }: { params: { storeId: string } }
) {
     try {
          const { userId } = auth();
          const body = await req.json();
          const { isActive } = body;

          if (!userId) {
               return new NextResponse("Unauthenticated", { status: 401 });
          }

          if (!params.storeId) {
               return new NextResponse("Store ID is required", { status: 400 });
          }

          // Generate a unique subdomain for the store
          const store = await prismadb.store.findUnique({
               where: {
                    id: params.storeId,
                    userId
               }
          });

          if (!store) {
               return new NextResponse("Store not found", { status: 404 });
          }

          // Generate store URL based on store name
          const storeUrl = isActive ?
               `https://${store.name.toLowerCase().replace(/\s+/g, '-')}.ecommercestore-online.vercel.app` :
               null;

          // Update store with new activation status and URL
          const updatedStore = await prismadb.store.update({
               where: {
                    id: params.storeId,
                    userId
               },
               data: {
                    isActive,
                    storeUrl
               }
          });

          return NextResponse.json(updatedStore);
     } catch (error) {
          console.log('[STORE_ACTIVATE_PATCH]', error);
          return new NextResponse("Internal error", { status: 500 });
     }
} 