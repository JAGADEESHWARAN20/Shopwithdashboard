// app/api/stores/[storeId]/update-vercel-env.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
     const { storeId } = params;

     try {
          const store = await prisma.store.findUnique({ where: { id: storeId } });
          if (!store) {
               return NextResponse.json({ error: 'Store not found' }, { status: 404 });
          }

          const apiUrl = `https://${store.name.toLowerCase()}.ecommercestore-online.vercel.app/api`;

          const projectId = process.env.VERCEL_PROJECT_ID;
          const token = process.env.VERCEL_API_TOKEN;
          const frontendProjectName = 'ecommercestore-online'; // Correct project name
          const frontendGitRepo = 'JAGADEESHWARAN20/shopwithdashboard-frontend'; // Correct repository
          const frontendGitBranch = 'main'; // Verify your branch

          if (!projectId || !token || !frontendProjectName || !frontendGitRepo || !frontendGitBranch) {
               return NextResponse.json({ error: 'Vercel configuration missing' }, { status: 500 });
          }

          // 1. Update NEXT_PUBLIC_API_URL environment variable
          const envUrl = `https://api.vercel.com/v9/projects/${projectId}/env/NEXT_PUBLIC_API_URL`;
          const envResponse = await fetch(envUrl, {
               method: 'PATCH',
               headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                    value: apiUrl,
                    type: 'PLAIN',
                    target: ['production'],
               }),
          });

          if (!envResponse.ok) {
               const envError = await envResponse.json();
               return NextResponse.json({ error: 'Failed to update Vercel environment variable', details: envError }, { status: 500 });
          }

          // 2. Trigger redeployment of ecommercestore-online
          const deployUrl = `https://api.vercel.com/v13/deployments`;
          const deployResponse = await fetch(deployUrl, {
               method: 'POST',
               headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                    name: frontendProjectName,
                    gitSource: {
                         type: 'github', // Or your git provider (e.g., gitlab, bitbucket)
                         repo: frontendGitRepo,
                         ref: frontendGitBranch,
                    },
               }),
          });

          if (!deployResponse.ok) {
               const deployError = await deployResponse.json();
               return NextResponse.json({ error: 'Failed to trigger redeployment', details: deployError }, { status: 500 });
          }

          return NextResponse.json({ message: 'Vercel environment variable updated and redeployment triggered' });

     } catch (error) {
          console.error('Error updating Vercel environment variable and redeploying:', error);
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }
}