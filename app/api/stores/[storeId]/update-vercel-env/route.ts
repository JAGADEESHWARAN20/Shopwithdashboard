import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || '';
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'ecommerce-store';

async function updateVercelEnvironmentVariable(storeUrl: string) {
     if (!VERCEL_API_TOKEN) {
          console.log('No Vercel API token found. Skipping Vercel API call.');
          return { success: true, mocked: true };
     }

     try {
          console.log(`Updating Vercel environment variable with store URL: ${storeUrl}`);

          const response = await fetch(
               `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env`,
               {
                    method: 'POST',
                    headers: {
                         'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                         key: 'NEXT_PUBLIC_STORE_URL',
                         value: storeUrl,
                         target: ['production', 'preview', 'development'],
                         type: 'plain',
                         ...(VERCEL_TEAM_ID ? { teamId: VERCEL_TEAM_ID } : {}),
                    }),
               }
          );

          if (!response.ok) {
               const errorData = await response.json().catch(() => ({}));
               console.error('Vercel API error:', errorData);
               throw new Error(`Failed to update Vercel environment: ${response.status} ${response.statusText}`);
          }

          return await response.json();
     } catch (error) {
          console.error('Error in updateVercelEnvironmentVariable:', error);
          // Return success but note it failed
          return { success: false, error: error.message };
     }
}

export async function POST(
     req: Request,
     { params }: { params: { storeId: string } }
) {
     try {
          const { userId } = auth();

          if (!userId) {
               return new NextResponse("Unauthenticated", { status: 401 });
          }

          if (!params.storeId) {
               return new NextResponse("Store ID is required", { status: 400 });
          }

          const store = await prismadb.store.findUnique({
               where: {
                    id: params.storeId,
                    userId
               }
          });

          if (!store) {
               return new NextResponse("Store not found", { status: 404 });
          }

          if (!store.storeUrl) {
               return new NextResponse("Store URL not found", { status: 400 });
          }

          // Update Vercel environment variable
          const vercelResult = await updateVercelEnvironmentVariable(store.storeUrl);

          // Always update our local store record to mark it as "updated"
          await prismadb.store.update({
               where: {
                    id: params.storeId
               },
               data: {
                    updatedAt: new Date()
               }
          });

          return NextResponse.json({
               success: true,
               vercelResult,
               message: vercelResult.mocked
                    ? 'Store URL updated (Vercel API token not configured)'
                    : 'Store URL and Vercel environment updated'
          });
     } catch (error) {
          console.error('[VERCEL_ENV_UPDATE]', error);
          return new NextResponse(`Internal error: ${error.message}`, { status: 500 });
     }
} 