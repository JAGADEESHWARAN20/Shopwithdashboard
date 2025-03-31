import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

const VERCEL_API_URL = "https://api.vercel.com/v9/projects";
const VERCEL_ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

export async function POST(
     req: NextRequest,
     { params }: { params: { storeId: string } }
): Promise<NextResponse> {
     try {
          // Extract required data from request
          const { userId, domainToAdd } = await req.json();

          // Validate environment configuration
          if (!VERCEL_ACCESS_TOKEN || !VERCEL_PROJECT_ID) {
               return NextResponse.json(
                    { error: "Server configuration error" },
                    { status: 500 }
               );
          }

          // Validate domain format
          if (!domainToAdd.endsWith("ecommercestore-online.vercel.app")) {
               return NextResponse.json(
                    { error: "Invalid domain format" },
                    { status: 400 }
               );
          }

          // Verify store ownership
          const store = await prismadb.store.findFirst({
               where: { id: params.storeId, userId },
          });

          if (!store) {
               return NextResponse.json({ error: "Store not found" }, { status: 404 });
          }

          // Add domain to Vercel
          const vercelResponse = await fetch(
               `${VERCEL_API_URL}/prj_VYsUGitlHUjIUHZOJjVnXAOTmsGI/domains`,
               {
                    method: "POST",
                    headers: {
                         "Content-Type": "application/json",
                         Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                    },
                    body: JSON.stringify({ name: domainToAdd }),
               }
          );

          if (!vercelResponse.ok) {
               const errorData = await vercelResponse.json();
               throw new Error(errorData.error.message || "Vercel domain addition failed");
          }

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
               message: "Domain added successfully",
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
