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

          return NextResponse.json(response.data.domains);
     } catch (error: any) {
          console.error("[LIST_DOMAINS_API]", error);
          return NextResponse.json(
               { error: error.response?.data?.error?.message || "Internal Server Error" },
               { status: 500 }
          );
     }
}