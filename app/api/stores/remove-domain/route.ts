import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

const VERCEL_API_URL = "https://api.vercel.com/v10/projects";
const TARGET_VERCEL_ACCESS_TOKEN = process.env.TARGET_VERCEL_ACCESS_TOKEN;
const TARGET_VERCEL_PROJECT_ID = process.env.TARGET_VERCEL_PROJECT_ID;

async function removeDomainFromVercel(domainToRemove: string) {
     if (!TARGET_VERCEL_ACCESS_TOKEN || !TARGET_VERCEL_PROJECT_ID) {
          throw new Error("TARGET_VERCEL_ACCESS_TOKEN or TARGET_VERCEL_PROJECT_ID is not configured");
     }

     try {
          const response = await fetch(
               `${VERCEL_API_URL}/${TARGET_VERCEL_PROJECT_ID}/domains/${domainToRemove}`,
               {
                    method: "DELETE",
                    headers: {
                         Authorization: `Bearer ${TARGET_VERCEL_ACCESS_TOKEN}`,
                    },
               }
          );

          if (!response.ok) {
               const errorData = await response.json();
               throw new Error(errorData.error.message || "Failed to remove domain from Vercel target project");
          }

          console.log("[MANAGE_DOMAINS_API] Domain removed successfully from target project:", response.status);
     } catch (error: any) {
          console.error("[MANAGE_DOMAINS_API] Error removing domain from target project:", error.message);
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
          if (!TARGET_VERCEL_ACCESS_TOKEN || !TARGET_VERCEL_PROJECT_ID) {
               return NextResponse.json({ error: "Target Server configuration error" }, { status: 500 });
          }

          // Verify store ownership
          const store = await prismadb.store.findFirst({
               where: { id: storeId, userId },
          });

          if (!store) {
               return NextResponse.json({ error: "Store not found" }, { status: 404 });
          }

          // Remove domain from Vercel target Project
          await removeDomainFromVercel(domainToRemove);

          // Update database (remove from store.alternateUrls and storeUrl)
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
               message: "Domain removed from target project successfully",
               storeUrl: updatedStore.storeUrl,
               alternateUrls: updatedStore.alternateUrls,
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