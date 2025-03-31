import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

const VERCEL_API_URL = "https://api.vercel.com/v9/projects";
const TARGET_VERCEL_ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN;
const TARGET_VERCEL_PROJECT_ID = process.env.TARGET_VERCEL_PROJECT_ID;

export async function POST(
     req: NextRequest,
     { params }: { params: { storeId: string } }
): Promise<NextResponse> {
     try {
          // Extract required data from request
          const { userId, domainToAdd } = await req.json();

          // Validate environment configuration
          if (!TARGET_VERCEL_ACCESS_TOKEN || !TARGET_VERCEL_PROJECT_ID) {
               return NextResponse.json({ error: "Target Server configuration error" }, { status: 500 });
          }

          // Validate domain format
          if (!domainToAdd.endsWith("ecommercestore-online.vercel.app")) {
               return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });
          }

          // Verify store ownership
          const store = await prismadb.store.findFirst({
               where: { id: params.storeId, userId },
          });

          if (!store) {
               return NextResponse.json({ error: "Store not found" }, { status: 404 });
          }

          // Add domain to Vercel (target project)
          const vercelResponse = await fetch(
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

          if (!vercelResponse.ok) {
               const errorData = await vercelResponse.json();
               console.error("[TARGET_DOMAIN_MANAGEMENT_ERROR] Vercel API Error:", errorData);
               return NextResponse.json(
                    {
                         error: errorData.error?.message || "Vercel domain addition failed (target project)",
                         details: errorData, // Include Vercel error details
                    },
                    { status: vercelResponse.status }
               );
          }

          const vercelResult = await vercelResponse.json();

          // Update database
          const updatedAlternateUrls = [...(store.alternateUrls || []), `https://${domainToAdd}`];

          const updatedStore = await prismadb.store.update({
               where: { id: params.storeId },
               data: {
                    storeUrl: `https://${domainToAdd}`,
                    alternateUrls: updatedAlternateUrls,
               },
          });

          return NextResponse.json({
               message: "Domain added to target project successfully",
               storeUrl: updatedStore.storeUrl,
               alternateUrls: updatedStore.alternateUrls,
               vercelData: vercelResult, // Include successful Vercel response
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