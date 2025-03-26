import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(
     req: Request,
     { params }: { params: { subdomain: string } }
) {
     try {
          if (!params.subdomain) {
               return new NextResponse("Subdomain is required", { status: 400 });
          }

          // Convert subdomain to store name format
          const storeName = params.subdomain.replace(/-/g, ' ');

          // Find store by name and check if it's active
          const store = await prismadb.store.findFirst({
               where: {
                    name: {
                         equals: storeName,
                         mode: 'insensitive'
                    },
                    isActive: true
               }
          });

          if (!store) {
               return new NextResponse("Store not found or inactive", { status: 404 });
          }

          return NextResponse.json(store);
     } catch (error) {
          console.log('[STORE_VALIDATE]', error);
          return new NextResponse("Internal error", { status: 500 });
     }
} 