import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosResponse } from "axios";
import prismadb from "@/lib/prismadb";

const VERCEL_API_URL = "https://api.vercel.com";
const VERCEL_ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

// Define the expected response type from Vercel API for adding a domain
interface VercelDomainResponse {
     name: string;
     // Add other fields as needed based on Vercel API documentation
}

async function removeDomainFromVercel(domainToRemove: string) {
     if (!VERCEL_ACCESS_TOKEN || !VERCEL_PROJECT_ID) {
          throw new Error("VERCEL_ACCESS_TOKEN or VERCEL_PROJECT_ID is not configured");
     }

     try {
          await axios.delete(`${VERCEL_API_URL}/v6/projects/${VERCEL_PROJECT_ID}/domains/${domainToRemove}`, {
               method: "DELETE",
               headers: {
                    Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
               },
          });
     } catch (error: any) {
          console.error("[MANAGE_DOMAINS_API] Error removing domain:", error.response?.data || error.message);
          if (error.response?.status === 429) {
               throw new Error("Rate limit exceeded. Please try again later.");
          }
          throw error;
     }
}

async function addDomainToVercel(domainToAdd: string) {
     if (!VERCEL_ACCESS_TOKEN || !VERCEL_PROJECT_ID) {
          throw new Error("VERCEL_ACCESS_TOKEN or VERCEL_PROJECT_ID is not configured");
     }

     try {
          const response: AxiosResponse<VercelDomainResponse> = await axios.post(
               `${VERCEL_API_URL}/v10/projects/${VERCEL_PROJECT_ID}/domains`,
               { name: domainToAdd },
               {
                    headers: {
                         Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                    },
               },
          );
          return response.data;
     } catch (error: any) {
          console.error("[MANAGE_DOMAINS_API] Error adding domain:", error.response?.data || error.message);
          if (error.response?.status === 429) {
               throw new Error("Rate limit exceeded. Please try again later.");
          }
          if (error.response?.data?.error?.code === "domain_taken") {
               throw new Error("Domain is already in use");
          }
          throw error;
     }
}

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
     try {
          const { userId, domainToAdd } = await req.json();

          console.log("params.storeId:", params.storeId);
          console.log("userId:", userId);

          const store = await prismadb.store.findFirst({
               where: { id: params.storeId, userId },
          });

          if (!store) {
               console.log("Store not found");
               return NextResponse.json({ error: "Store not found" }, { status: 404 });
          }

          let alternateUrls: string[] = store.alternateUrls || [];
          let newStoreUrl = store.storeUrl;

          // Validate domains
          if (domainToAdd && !domainToAdd.endsWith("ecommercestore-online.vercel.app")) {
               return NextResponse.json({ error: "Invalid domain to add" }, { status: 400 });
          }

          if (domainToAdd) {
               try {
                    await addDomainToVercel(domainToAdd);
                    alternateUrls.push(`https://${domainToAdd}`);
                    newStoreUrl = `https://${domainToAdd}`; // Update primary storeUrl
               } catch (error: any) {
                    return NextResponse.json({ error: error.message }, { status: error.response?.status || 500 });
               }
          }

          await prismadb.store.update({
               where: { id: params.storeId, userId },
               data: { alternateUrls, storeUrl: newStoreUrl },
          });

          return NextResponse.json({
               message: "Domain added successfully",
               storeUrl: newStoreUrl,
               alternateUrls,
          });
     } catch (error: any) {
          console.error("[MANAGE_DOMAINS_API]", error);
          return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
     }
}

export async function DELETE(req: NextRequest, { params }: { params: { storeId: string } }) {
     try {
          const { userId, domainToRemove } = await req.json();

          console.log("params.storeId:", params.storeId);
          console.log("userId:", userId);

          const store = await prismadb.store.findFirst({
               where: { id: params.storeId, userId },
          });

          if (!store) {
               console.log("Store not found");
               return NextResponse.json({ error: "Store not found" }, { status: 404 });
          }

          let alternateUrls: string[] = store.alternateUrls || [];
          let newStoreUrl = store.storeUrl;

          // Validate domains
          if (domainToRemove && !domainToRemove.endsWith("ecommercestore-online.vercel.app")) {
               return NextResponse.json({ error: "Invalid domain to remove" }, { status: 400 });
          }

          if (domainToRemove) {
               try {
                    await removeDomainFromVercel(domainToRemove);
                    alternateUrls = alternateUrls.filter((url: string) => url !== `https://${domainToRemove}`);
                    if (store.storeUrl === `https://${domainToRemove}`) {
                         newStoreUrl = alternateUrls.length > 0 ? alternateUrls[0] : null;
                    }
               } catch (error: any) {
                    return NextResponse.json({ error: error.message }, { status: error.response?.status || 500 });
               }
          }

          await prismadb.store.update({
               where: { id: params.storeId, userId },
               data: { alternateUrls, storeUrl: newStoreUrl },
          });

          return NextResponse.json({
               message: "Domain removed successfully",
               storeUrl: newStoreUrl,
               alternateUrls,
          });
     } catch (error: any) {
          console.error("[MANAGE_DOMAINS_API]", error);
          return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
     }
}