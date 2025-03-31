import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import axios from "axios";

const VERCEL_API_URL = "https://api.vercel.com/v10/projects";
const VERCEL_ACCESS_TOKEN = process.env.TARGET_VERCEL_ACCESS_TOKEN;
const VERCEL_PROJECT_ID = process.env.TARGET_VERCEL_PROJECT_ID;

async function removeDomainFromVercel(domainToRemove: string) {
     if (!VERCEL_ACCESS_TOKEN || !VERCEL_PROJECT_ID) {
          throw new Error("VERCEL_ACCESS_TOKEN or VERCEL_PROJECT_ID is not configured");
     }

     try {
          // Use the Vercel API to remove the domain from the project
          const response = await fetch(
               `${VERCEL_API_URL}/${VERCEL_PROJECT_ID}/domains/${domainToRemove}`,
               {
                    method: "DELETE",
                    headers: {
                         Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                    },
               }
          );

          if (!response.ok) {
               const errorData = await response.json();
               throw new Error(errorData.error.message || "Failed to remove domain from Vercel");
          }

          console.log("[MANAGE_DOMAINS_API] Domain removed successfully:", response.status);
     } catch (error: any) {
          console.error("[MANAGE_DOMAINS_API] Error removing domain:", error.message);
          throw error;
     }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
     try {
          const { storeId, userId, domainToRemove } = await req.json();

          if (!domainToRemove) {
               return NextResponse.json({ error: "Domain to remove is required" }, { status: 400 });
          }

          // Validate environment configuration
          if (!VERCEL_ACCESS_TOKEN || !VERCEL_PROJECT_ID) {
               return NextResponse.json(
                    { error: "Server configuration error" },
                    { status: 500 }
               );
          }

          // Verify store ownership
          const store = await prismadb.store.findFirst({
               where: { id: storeId, userId },
          });

          if (!store) {
               return NextResponse.json({ error: "Store not found" }, { status: 404 });
          }

          // Remove domain from Vercel
          await removeDomainFromVercel(domainToRemove);

          // Update database
          let alternateUrls: string[] = store.alternateUrls || [];
          let newStoreUrl = store.storeUrl;

          alternateUrls = alternateUrls.filter((url: string) => url !== `https://${domainToRemove}`);
          if (store.storeUrl === `https://${domainToRemove}`) {
               newStoreUrl = alternateUrls.length > 0 ? alternateUrls[0] : null;
          }

          const updatedStore = await prismadb.store.update({
               where: { id: storeId },
               data: {
                    storeUrl: newStoreUrl,
                    alternateUrls: alternateUrls,
               },
          });

          return NextResponse.json({
               message: "Domain removed successfully",
               storeUrl: updatedStore.storeUrl,
               alternateUrls: updatedStore.alternateUrls,
          });
     } catch (error: any) {
          console.error("[DOMAIN_MANAGEMENT_ERROR]", error);
          return NextResponse.json(
               {
                    error: error.message || "Operation failed",
                    details: error.cause || "Unknown error",
               },
               { status: error.status || 500 }
          );
     }
}
