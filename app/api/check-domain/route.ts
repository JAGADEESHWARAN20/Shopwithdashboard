import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const VERCEL_API_URL = "https://api.vercel.com";
const VERCEL_ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

interface VercelDomain {
     name: string;
     [key: string]: any;
}

interface VercelDomainsResponse {
     domains: VercelDomain[];
     pagination?: {
          next: number | null;
          prev: number | null;
          count: number;
     };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
     try {
          const { searchParams } = new URL(req.url);
          const domainName = searchParams.get("domainName");

          if (!domainName) {
               return NextResponse.json({ error: "Domain name is required" }, { status: 400 });
          }

          if (!VERCEL_ACCESS_TOKEN || !VERCEL_PROJECT_ID) {
               return NextResponse.json(
                    { error: "VERCEL_ACCESS_TOKEN or VERCEL_PROJECT_ID is not configured" },
                    { status: 500 }
               );
          }

          const url = `${VERCEL_API_URL}/v9/projects/${VERCEL_PROJECT_ID}/domains?domain=${domainName}`;

          const response = await axios.get<VercelDomainsResponse>(url, {
               headers: {
                    Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
               },
          });

          const domainExists = response.data.domains.some((domain) => domain.name === domainName);

          return NextResponse.json({ exists: domainExists });
     } catch (error: any) {
          console.error("[DOMAIN_CHECK_API] Error:", error.response?.data || error.message);

          let status = 500;
          let message = "Internal Server Error";

          if (axios.isAxiosError(error)) {
               if (error.response?.status === 429) {
                    status = 429;
                    message = "Rate limit exceeded. Please try again later.";
               } else if (error.response?.status === 403) {
                    status = 403;
                    message = "Unauthorized access to Vercel API";
               } else if (error.response?.data?.error?.message) {
                    message = error.response?.data?.error?.message;
               }
          }

          return NextResponse.json({ error: message }, { status: status });
     }
}
