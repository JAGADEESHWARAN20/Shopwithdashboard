import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import prismadb from "@/lib/prismadb";

const VERCEL_API_URL = "https://api.vercel.com";
const VERCEL_ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
     try {
          const { userId, domainToRemove, domainToAdd } = await req.json();

          if (!userId || !params.storeId) {
               return NextResponse.json({ error: "Unauthorized or missing storeId" }, { status: 401 });
          }

          if (!VERCEL_ACCESS_TOKEN || !VERCEL_PROJECT_ID) {
               return NextResponse.json(
                    { error: "VERCEL_ACCESS_TOKEN or VERCEL_PROJECT_ID is not configured" },
                    { status: 500 }
               );
          }

          if (domainToRemove) {
               try {
                    console.log(`Removing domain ${domainToRemove} from project ${VERCEL_PROJECT_ID}...`);
                    await axios.delete(`${VERCEL_API_URL}/v9/projects/${VERCEL_PROJECT_ID}/domains/${domainToRemove}`, {
                         headers: {
                              Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                         },
                    });
                    console.log(`Domain ${domainToRemove} removed successfully`);
               } catch (error: any) {
                    console.error(`Error removing domain ${domainToRemove}:`, error.response?.data || error.message);
                    return NextResponse.json(
                         { error: `Failed to remove domain: ${error.response?.data?.error?.message || error.message}` },
                         { status: 500 }
                    );
               }
          }

          if (domainToAdd) {
               try {
                    console.log(`Adding domain ${domainToAdd} to project ${VERCEL_PROJECT_ID}...`);
                    const response = await axios.post(
                         `${VERCEL_API_URL}/v9/projects/${VERCEL_PROJECT_ID}/domains`,
                         { name: domainToAdd },
                         {
                              headers: {
                                   Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                              },
                         }
                    );
                    console.log(`Domain ${domainToAdd} added successfully:`, response.data);

                    await prismadb.store.update({
                         where: { id: params.storeId, userId },
                         data: { storeUrl: `https://${domainToAdd}` },
                    });

                    const envVars = [
                         { key: "NEXT_PUBLIC_API_URL", value: `https://${domainToAdd}/api`, type: "plain" },
                         { key: "NEXT_PUBLIC_STORE_ID", value: params.storeId, type: "plain" },
                    ];

                    await axios.patch(
                         `${VERCEL_API_URL}/v10/projects/${VERCEL_PROJECT_ID}/env`,
                         { env: envVars },
                         {
                              headers: {
                                   Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                              },
                         }
                    );
               } catch (error: any) {
                    console.error(`Error adding domain ${domainToAdd}:`, error.response?.data || error.message);
                    return NextResponse.json(
                         { error: `Failed to add domain: ${error.response?.data?.error?.message || error.message}` },
                         { status: 500 }
                    );
               }
          }

          return NextResponse.json({
               message: "Domain management completed successfully",
          });
     } catch (error: any) {
          console.error("[MANAGE_DOMAINS_API]", error);
          return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
     }
}