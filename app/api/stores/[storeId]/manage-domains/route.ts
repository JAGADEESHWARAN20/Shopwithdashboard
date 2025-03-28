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

          const store = await prismadb.store.findFirst({
               where: { id: params.storeId, userId },
          });

          if (!store) {
               return NextResponse.json({ error: "Store not found" }, { status: 404 });
          }

          let alternateUrls = store.alternateUrls || [];

          if (domainToRemove) {
               await axios.delete(`${VERCEL_API_URL}/v9/projects/${VERCEL_PROJECT_ID}/domains/${domainToRemove}`, {
                    headers: {
                         Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                    },
               });
               alternateUrls = alternateUrls.filter((url) => url !== `https://${domainToRemove}`);
          }

          if (domainToAdd) {
               const response = await axios.post(
                    `${VERCEL_API_URL}/v9/projects/${VERCEL_PROJECT_ID}/domains`,
                    { name: domainToAdd },
                    {
                         headers: {
                              Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                         },
                    }
               );
               alternateUrls.push(`https://${domainToAdd}`);
          }

          await prismadb.store.update({
               where: { id: params.storeId, userId },
               data: { alternateUrls },
          });

          return NextResponse.json({
               message: "Domain management completed successfully",
          });
     } catch (error: any) {
          console.error("[MANAGE_DOMAINS_API]", error);
          return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
     }
}