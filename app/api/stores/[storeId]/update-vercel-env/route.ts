// app/api/[storeId]/update-vercel-env/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

const VERCEL_API_URL = "https://api.vercel.com";
const VERCEL_ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
     try {
          if (!VERCEL_ACCESS_TOKEN || !VERCEL_PROJECT_ID) {
               return new NextResponse("Vercel credentials are missing", { status: 500 });
          }

          const body = await req.json();
          const { storeUrl } = body;

          if (!storeUrl) {
               return new NextResponse("storeUrl is required", { status: 400 });
          }

          // Fetch existing environment variables
          const envResponse = await axios.get(
               `${VERCEL_API_URL}/v10/projects/${VERCEL_PROJECT_ID}/env`,
               {
                    headers: {
                         Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                    },
               }
          );

          const envVars = envResponse.data.envs;
          const storeUrlEnv = envVars.find((env: any) => env.key === "NEXT_PUBLIC_STORE_URL");

          if (storeUrlEnv) {
               // Update existing environment variable
               await axios.patch(
                    `${VERCEL_API_URL}/v10/projects/${VERCEL_PROJECT_ID}/env/${storeUrlEnv.id}`,
                    {
                         value: storeUrl,
                    },
                    {
                         headers: {
                              Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                         },
                    }
               );
          } else {
               // Create new environment variable
               await axios.post(
                    `${VERCEL_API_URL}/v10/projects/${VERCEL_PROJECT_ID}/env`,
                    {
                         key: "NEXT_PUBLIC_STORE_URL",
                         value: storeUrl,
                         type: "plain",
                         target: ["production", "preview", "development"],
                    },
                    {
                         headers: {
                              Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                         },
                    }
               );
          }

          return NextResponse.json({ message: "Environment variable updated successfully" });
     } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
               return new NextResponse(
                    `Failed to update environment variable: ${error.response?.data?.error?.message || error.message}`,
                    { status: 500 }
               );
          }
          return new NextResponse("Internal error", { status: 500 });
     }
}