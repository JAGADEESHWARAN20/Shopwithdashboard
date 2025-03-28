import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

const STORE_BASE_DOMAIN = process.env.STORE_BASE_DOMAIN || "ecommercestore-online.vercel.app";

export async function GET(
     req: Request,
     { params }: { params: { subdomain: string } }
) {
     try {
          if (!params.subdomain) {
               return new NextResponse("Subdomain is required", { status: 400 });
          }

          const storeName = params.subdomain.replace(/-/g, " ").trim().replace(/\s+/g, " ");

          console.log(`Validating store with subdomain: ${params.subdomain}, looking for store name: ${storeName}`);

          const store = await prismadb.store.findFirst({
               where: {
                    name: {
                         equals: storeName,
                         mode: "insensitive",
                    },
                    isActive: true,
               },
          });

          if (!store) {
               console.log(`Store not found or inactive for subdomain: ${params.subdomain}`);
               return new NextResponse(`Store not found or inactive for subdomain: ${params.subdomain}`, { status: 404 });
          }

          console.log(`Store found for subdomain: ${params.subdomain}, ID: ${store.id}, Name: ${store.name}`);

          const correctUrl = `https://${params.subdomain}-${STORE_BASE_DOMAIN}`;
          if (store.storeUrl !== correctUrl) {
               console.log(`Updating store URL from: ${store.storeUrl} to ${correctUrl}`);

               await prismadb.store.update({
                    where: { id: store.id },
                    data: { storeUrl: correctUrl },
               });

               store.storeUrl = correctUrl;
          }

          return NextResponse.json(store);
     } catch (error) {
          console.error("[STORE_VALIDATE]", error);
          return new NextResponse("Internal server error while validating store", { status: 500 });
     }
}