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

          console.log(`Validating store with subdomain: ${params.subdomain}, looking for store name: ${storeName}`);

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
               console.log(`Store not found or inactive for subdomain: ${params.subdomain}`);
               return new NextResponse("Store not found or inactive", { status: 404 });
          }

          console.log(`Store found for subdomain: ${params.subdomain}, ID: ${store.id}, Name: ${store.name}`);

          // Ensure the storeUrl is properly formatted
          if (!store.storeUrl || store.storeUrl.includes('-git-main-jagadeeshwaran20s-projects.vercel.app')) {
               const correctUrl = `https://${params.subdomain}.ecommercestore-online.vercel.app`;
               console.log(`Updating incorrect store URL: ${store.storeUrl} to ${correctUrl}`);

               // Fix the store URL in the database
               await prismadb.store.update({
                    where: { id: store.id },
                    data: { storeUrl: correctUrl }
               });

               // Update the returned store object
               store.storeUrl = correctUrl;
          }

          return NextResponse.json(store);
     } catch (error) {
          console.log('[STORE_VALIDATE]', error);
          return new NextResponse("Internal error", { status: 500 });
     }
} 