import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosResponse } from "axios";

// Define the expected response type from Vercel API for listing domains
interface VercelDomainsResponse {
     domains: Array<{ name: string;[key: string]: any }>;
     pagination?: {
          next: number | null;
          prev: number | null;
          count: number;
     };
}

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

          let allDomains: Array<{ name: string;[key: string]: any }> = [];
          let nextTimestamp: number | null = null;

          // Fetch all domains with pagination
          do {
               const url: string = nextTimestamp
                    ? `${VERCEL_API_URL}/v9/projects/${VERCEL_PROJECT_ID}/domains?until=${nextTimestamp}`
                    : `${VERCEL_API_URL}/v9/projects/${VERCEL_PROJECT_ID}/domains`;

               const response: AxiosResponse<VercelDomainsResponse> = await axios.get(url, {
                    headers: {
                         Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                    },
               });

               allDomains.push(...response.data.domains);
               nextTimestamp = response.data.pagination?.next || null;
          } while (nextTimestamp);

          // Filter domains to only include frontend domains
          const filteredDomains = allDomains.filter((domain) =>
               domain.name.endsWith("ecommercestore-online.vercel.app")
          );

          return NextResponse.json(filteredDomains);
     } catch (error: any) {
          console.error("[LIST_DOMAINS_API] Error:", error.response?.data || error.message);
          if (error.response?.status === 429) {
               return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
          }
          if (error.response?.status === 403) {
               return NextResponse.json({ error: "Unauthorized access to Vercel API" }, { status: 403 });
          }
          return NextResponse.json(
               { error: error.response?.data?.error?.message || "Internal Server Error" },
               { status: 500 }
          );
     }
}

export async function OPTIONS() {
     return new NextResponse(null, {
          status: 204,
          headers: {
               "Access-Control-Allow-Origin": process.env.NODE_ENV === "production" ? "https://your-frontend-domain.com" : "*",
               "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
               "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
     });
}