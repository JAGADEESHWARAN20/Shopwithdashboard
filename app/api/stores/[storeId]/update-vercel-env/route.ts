import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

async function updateVercelEnvironmentVariable(storeUrl: string) {
     const response = await fetch(
          `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env`,
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
                    teamId: VERCEL_TEAM_ID,
               }),
          }
     );

     if (!response.ok) {
          throw new Error('Failed to update Vercel environment variable');
     }

     return response.json();
}

async function triggerVercelDeployment() {
     const response = await fetch(
          `https://api.vercel.com/v13/deployments`,
          {
               method: 'POST',
               headers: {
                    'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
                    'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                    name: 'ecommerce-store',
                    project: VERCEL_PROJECT_ID,
                    teamId: VERCEL_TEAM_ID,
                    gitSource: {
                         type: 'github',
                         repoId: process.env.GITHUB_REPO_ID,
                         ref: 'main',
                    },
               }),
          }
     );

     if (!response.ok) {
          throw new Error('Failed to trigger Vercel deployment');
     }

     return response.json();
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
          await updateVercelEnvironmentVariable(store.storeUrl);

          // Trigger Vercel deployment
          await triggerVercelDeployment();

          return NextResponse.json({
               success: true,
               message: 'Vercel environment updated and deployment triggered'
          });
     } catch (error) {
          console.log('[VERCEL_ENV_UPDATE]', error);
          return new NextResponse("Internal error", { status: 500 });
     }
} 