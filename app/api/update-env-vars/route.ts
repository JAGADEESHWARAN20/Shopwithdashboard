import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import prismadb from "@/lib/prismadb";

const VERCEL_API_URL = "https://api.vercel.com";
const VERCEL_ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID; // Use the same project ID

// Interface for environment variable structure
interface EnvVar {
     key: string;
     value: string;
     target: string[];
}

// Function to update or create an environment variable in Vercel project
async function updateEnvVariable(projectId: string, key: string, value: string, target: string[] = ["production"]) {
     if (!VERCEL_ACCESS_TOKEN) {
          throw new Error("VERCEL_ACCESS_TOKEN is not set in the environment variables.");
     }

     try {
          const envResponse = await axios.get(`${VERCEL_API_URL}/v9/projects/${projectId}/env`, {
               headers: {
                    Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
               },
          });

          const existingEnv = envResponse.data.envs.find((env: any) => env.key === key);

          if (existingEnv) {
               const updateResponse = await axios.patch(
                    `${VERCEL_API_URL}/v9/projects/${projectId}/env/${existingEnv.id}`,
                    {
                         value,
                         target,
                    },
                    {
                         headers: {
                              Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                              "Content-Type": "application/json",
                         },
                    }
               );
               console.log(`[ENV_UPDATE] Updated environment variable ${key} in Vercel project.`);
               return updateResponse.data;
          } else {
               const createResponse = await axios.post(
                    `${VERCEL_API_URL}/v9/projects/${projectId}/env`,
                    {
                         key,
                         value,
                         target,
                         type: "encrypted",
                    },
                    {
                         headers: {
                              Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                              "Content-Type": "application/json",
                         },
                    }
               );
               console.log(`[ENV_UPDATE] Created environment variable ${key} in Vercel project.`);
               return createResponse.data;
          }
     } catch (error) {
          if (error instanceof AxiosError) {
               const errorCode = error.response?.data?.error?.code;
               let errorMessage = `Failed to update environment variable ${key}: ${error.message}`;
               if (errorCode) {
                    errorMessage += ` (Error code: ${errorCode})`;
               }
               throw new Error(errorMessage);
          }
          throw error;
     }
}

export async function POST(req: NextRequest) {
     try {
          const { userId, storeId } = await req.json();

          if (!userId || !storeId) {
               return NextResponse.json({ error: "Unauthorized or missing storeId" }, { status: 401 });
          }

          if (!VERCEL_PROJECT_ID) {
               return NextResponse.json({ error: "VERCEL_PROJECT_ID is not configured" }, { status: 500 });
          }

          const store = await prismadb.store.findUnique({
               where: {
                    id: storeId,
                    userId: userId,
               },
          });

          if (!store) {
               return NextResponse.json({ error: "Store not found or unauthorized" }, { status: 404 });
          }

          const apiUrl = `https://${store.name}.ecommercestore-online.vercel.app/api`;

          const envVars: EnvVar[] = [
               {
                    key: "NEXT_PUBLIC_API_URL",
                    value: apiUrl,
                    target: ["production"],
               },
               {
                    key: "NEXT_PUBLIC_STORE_ID",
                    value: storeId,
                    target: ["production"],
               },
          ];

          const results = await Promise.all(
               envVars.map((envVar) =>
                    updateEnvVariable(VERCEL_PROJECT_ID, envVar.key, envVar.value, envVar.target)
               )
          );

          return NextResponse.json({
               message: "Environment variables updated successfully",
               results,
          });
     } catch (error) {
          console.error("[UPDATE_ENV_VARS_API]", error);
          if (error instanceof Error) {
               return NextResponse.json({ error: error.message }, { status: 500 });
          }
          return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
     }
}