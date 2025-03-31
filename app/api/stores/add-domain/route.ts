import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

const VERCEL_API_URL = "https://api.vercel.com/v10/projects"; // Using v10, as specified
const TARGET_VERCEL_ACCESS_TOKEN = process.env.TARGET_VERCEL_ACCESS_TOKEN;
const TARGET_VERCEL_PROJECT_ID = process.env.TARGET_VERCEL_PROJECT_ID;

async function addDomainToVercel(domainToAdd: string) {
     if (!TARGET_VERCEL_ACCESS_TOKEN || !TARGET_VERCEL_PROJECT_ID) {
          throw new Error("TARGET_VERCEL_ACCESS_TOKEN or TARGET_VERCEL_PROJECT_ID is not configured");
     }

     try {
          const response = await fetch(
               `${VERCEL_API_URL}/${TARGET_VERCEL_PROJECT_ID}/domains`,
               {
                    method: "POST",
                    headers: {
                         "Content-Type": "application/json",
                         Authorization: `Bearer ${TARGET_VERCEL_ACCESS_TOKEN}`,
                    },
                    body: JSON.stringify({ name: domainToAdd }),
               }
          );

          if (!response.ok) {
               const errorData = await response.json();
               throw new Error(errorData.error?.message || "Failed to add domain to Vercel target project");
          }

          console.log("[MANAGE_DOMAINS_API] Domain added successfully to target project:", response.status);
          return await response.json(); // Return the response data
     } catch (error: any) {
          console.error("[MANAGE_DOMAINS_API] Error adding domain to target project:", error.message);
          throw error;
     }
}

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }): Promise<NextResponse> {
     try {
          const { storeId, userId, domainToAdd } = await req.json();

          if (!domainToAdd) {
               return NextResponse.json({ error: "Domain to add is required" }, { status: 400 });
          }

          if (!TARGET_VERCEL_ACCESS_TOKEN || !TARGET_VERCEL_PROJECT_ID) {
               return NextResponse.json({ error: "Target Server configuration error" }, { status: 500 });
          }

          const store = await prismadb.store.findFirst({
               where: { id: storeId, userId },
          });

          if (!store) {
               return NextResponse.json({ error: "Store not found" }, { status: 404 });
          }

          const vercelData = await addDomainToVercel(domainToAdd);

          const updatedAlternateUrls = [...(store.alternateUrls || []), `https://${domainToAdd}`];

          const updatedStore = await prismadb.store.update({
               where: { id: storeId },
               data: {
                    storeUrl: `https://${domainToAdd}`,
                    alternateUrls: updatedAlternateUrls,
               },
          });

          return NextResponse.json({
               message: "Domain added to target project successfully",
               storeUrl: updatedStore.storeUrl,
               alternateUrls: updatedStore.alternateUrls,
               vercelData: vercelData, // Include the Vercel API response data
          });
     } catch (error: any) {
          console.error("[TARGET_DOMAIN_MANAGEMENT_ERROR]", error);
          return NextResponse.json(
               {
                    error: error.message || "Operation failed",
                    details: error.cause || "Unknown error",
               },
               { status: error.status || 500 }
          );
     }
}