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

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
     try {
          const { userId, domainToRemove, domainToAdd } = await req.json();

          console.log("params.storeId:", params.storeId);
          console.log("userId:", userId);

          if (!VERCEL_ACCESS_TOKEN || !VERCEL_PROJECT_ID) {
               return NextResponse.json(
                    { error: "VERCEL_ACCESS_TOKEN or VERCEL_PROJECT_ID is not configured" },
                    { status: 500 }
               );
          }

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
          if (domainToAdd && !domainToAdd.endsWith("ecommercestore-online.vercel.app")) {
               return NextResponse.json({ error: "Invalid domain to add" }, { status: 400 });
          }

          if (domainToRemove) {
               try {
                    await axios.delete(`${VERCEL_API_URL}/v6/projects/${VERCEL_PROJECT_ID}/domains/${domainToRemove}`, {
                         headers: {
                              Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                         },
                    });
                    alternateUrls = alternateUrls.filter((url: string) => url !== `https://${domainToRemove}`);
                    if (store.storeUrl === `https://${domainToRemove}`) {
                         newStoreUrl = alternateUrls.length > 0 ? alternateUrls[0] : null;
                    }
               } catch (error: any) {
                    console.error("[MANAGE_DOMAINS_API] Error removing domain:", error.response?.data || error.message);
                    if (error.response?.status === 429) {
                         return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
                    }
                    throw error;
               }
          }

          if (domainToAdd) {
               try {
                    const response: AxiosResponse<VercelDomainResponse> = await axios.post(
                         `${VERCEL_API_URL}/v9/projects/${VERCEL_PROJECT_ID}/domains`,
                         { name: domainToAdd },
                         {
                              headers: {
                                   Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                              },
                         }
                    );
                    alternateUrls.push(`https://${domainToAdd}`);
                    newStoreUrl = `https://${domainToAdd}`; // Update primary storeUrl
               } catch (error: any) {
                    console.error("[MANAGE_DOMAINS_API] Error adding domain:", error.response?.data || error.message);
                    if (error.response?.status === 429) {
                         return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
                    }
                    if (error.response?.data?.error?.code === "domain_taken") {
                         return NextResponse.json({ error: "Domain is already in use" }, { status: 400 });
                    }
                    throw error;
               }
          }

          await prismadb.store.update({
               where: { id: params.storeId, userId },
               data: { alternateUrls, storeUrl: newStoreUrl },
          });

          return NextResponse.json({
               message: "Domain management completed successfully",
               storeUrl: newStoreUrl,
               alternateUrls,
          });
     } catch (error: any) {
          console.error("[MANAGE_DOMAINS_API]", error);
          return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
     }
}