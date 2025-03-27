import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const VERCEL_API_URL = "https://api.vercel.com";
const VERCEL_ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
     try {
          console.log("[LIST_DOMAINS_API] Request received:", { url: req.url, storeId: params.storeId });

          const { searchParams } = new URL(req.url);
          const userId = searchParams.get("userId");

          if (!userId || !params.storeId) {
               console.error("[LIST_DOMAINS_API] Missing userId or storeId:", { userId, storeId: params.storeId });
               return NextResponse.json({ error: "Unauthorized or missing storeId" }, { status: 401 });
          }

          if (!VERCEL_ACCESS_TOKEN || !VERCEL_PROJECT_ID) {
               console.error("[LIST_DOMAINS_API] Missing Vercel credentials:", { VERCEL_ACCESS_TOKEN, VERCEL_PROJECT_ID });
               return NextResponse.json(
                    { error: "VERCEL_ACCESS_TOKEN or VERCEL_PROJECT_ID is not configured" },
                    { status: 500 }
               );
          }

          const response = await axios.get(`${VERCEL_API_URL}/v9/projects/${VERCEL_PROJECT_ID}/domains`, {
               headers: {
                    Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
               },
          });

          console.log("[LIST_DOMAINS_API] Domains fetched successfully:", response.data.domains);
          return NextResponse.json(response.data.domains);
     } catch (error: any) {
          console.error("[LIST_DOMAINS_API] Error:", error.response?.data || error.message);
          return NextResponse.json(
               { error: error.response?.data?.error?.message || "Internal Server Error" },
               { status: 500 }
          );
     }
}

// Handle OPTIONS for CORS preflight requests
export async function OPTIONS() {
     return new NextResponse(null, {
          status: 204,
          headers: {
               "Access-Control-Allow-Origin": "*",
               "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
               "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
     });
}