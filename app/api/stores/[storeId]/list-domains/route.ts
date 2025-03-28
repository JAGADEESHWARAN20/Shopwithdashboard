import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const VERCEL_API_URL = "https://api.vercel.com";
const VERCEL_ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
     try {
          const { searchParams } = new URL(req.url);
          const userId = searchParams.get("userId");

          if (!userId || !params.storeId) {
               return NextResponse.json({ error: "Unauthorized or missing storeId" }, { status: 401 });
          }

          if (!VERCEL_ACCESS_TOKEN || !VERCEL_PROJECT_ID) {
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

          // Filter domains to only include frontend domains
          const filteredDomains = response.data.domains.filter((domain: any) =>
               domain.name.endsWith("ecommercestore-online.vercel.app")
          );

          return NextResponse.json(filteredDomains);
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