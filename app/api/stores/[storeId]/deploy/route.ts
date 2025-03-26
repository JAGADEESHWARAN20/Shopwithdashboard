// app/api/stores/[storeId]/deploy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import axios from "axios";

const VERCEL_API_URL = "https://api.vercel.com";
const VERCEL_ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
     try {
          const { userId } = getAuth(req);

          if (!userId) {
               return new NextResponse("Unauthenticated", { status: 401 });
          }

          if (!params.storeId) {
               return new NextResponse("Store ID is required", { status: 400 });
          }

          if (!VERCEL_ACCESS_TOKEN || !VERCEL_PROJECT_ID) {
               return new NextResponse("Vercel credentials are missing", { status: 500 });
          }

          // Trigger a new deployment (simplified example)
          const response = await axios.post(
               `${VERCEL_API_URL}/v13/deployments`,
               {
                    projectId: VERCEL_PROJECT_ID,
                    // Add other deployment options as needed
               },
               {
                    headers: {
                         Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                    },
               }
          );

          return NextResponse.json({ message: "Deployment triggered successfully", deployment: response.data });
     } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
               return new NextResponse(
                    `Failed to trigger deployment: ${error.response?.data?.error?.message || error.message}`,
                    { status: 500 }
               );
          }
          return new NextResponse("Internal error", { status: 500 });
     }
}