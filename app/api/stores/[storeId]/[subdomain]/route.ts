import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import axios from "axios";

const STORE_BASE_DOMAIN = process.env.STORE_BASE_DOMAIN || "ecommercestore-online.vercel.app";
const VERCEL_API_URL = "https://api.vercel.com";
const VERCEL_ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

export async function GET(
     req: Request,
     { params }: { params: { storeId: string; subdomain: string } }
) {
     try {
          if (!params.subdomain) {
               return new NextResponse("Subdomain is required", { status: 400 });
          }

          if (!params.storeId) {
               return new NextResponse("Store Id is required", { status: 400 })
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
                    id: params.storeId,
               },
          });

          if (!store) {
               console.log(`Store not found or inactive for subdomain: ${params.subdomain}`);
               return NextResponse.json({ domainStatus: false, storeUrl: null }, { status: 404 });
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

          // Check Domain Status from Vercel API
          let domainStatus = false;
          if (VERCEL_ACCESS_TOKEN && VERCEL_PROJECT_ID) {
               try {
                    const domainStatusResponse = await axios.get(
                         `${VERCEL_API_URL}/v9/projects/${VERCEL_PROJECT_ID}/domains?domain=${correctUrl.replace("https://", "")}`,
                         {
                              headers: {
                                   Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                              },
                         }
                    );

                    const vercelDomains = domainStatusResponse.data.domains;
                    const domainExists = vercelDomains.some((d: any) => d.name === correctUrl.replace("https://", ""));
                    domainStatus = domainExists ? true : false;
                    console.log(`Domain status for ${correctUrl}: ${domainStatus}`);

               } catch (vercelError) {
                    console.error("[STORE_VALIDATE] Error fetching domain status from Vercel:", vercelError);
                    domainStatus = false;
               }
          }
          return NextResponse.json({ domainStatus: domainStatus, storeUrl: store.storeUrl });
     } catch (error) {
          console.error("[STORE_VALIDATE]", error);
          return new NextResponse("Internal server error while validating store", { status: 500 });
     }
}
