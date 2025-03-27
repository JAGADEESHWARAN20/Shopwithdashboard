// app/api/update-env-vars/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import prismadb from '@/lib/prismadb';

const VERCEL_ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN; // Updated to VERCEL_ACCESS_TOKEN
const VERCEL_FRONTEND_PROJECT_ID = process.env.VERCEL_FRONTEND_PROJECT_ID;

export async function POST(req: NextRequest) {
  try {
    const { userId, storeId } = await req.json();

    if (!userId || !storeId) {
      return NextResponse.json({ error: 'Unauthorized or missing storeId' }, { status: 401 });
    }

    const store = await prismadb.store.findUnique({
      where: {
        id: storeId,
        userId: userId,
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found or unauthorized' }, { status: 404 });
    }

    const apiUrl = `https://${store.name}.ecommercestore-online.vercel.app/api`;

    const envVars = [
      {
        key: 'NEXT_PUBLIC_API_URL',
        value: apiUrl,
        target: 'production',
      },
      {
        key: 'NEXT_PUBLIC_STORE_ID',
        value: storeId,
        target: 'production',
      },
    ];

    const response = await axios.patch(
      `https://api.vercel.com/v13/projects/${VERCEL_FRONTEND_PROJECT_ID}/env`,
      { env: envVars },
      {
        headers: {
          Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`, // Updated to VERCEL_ACCESS_TOKEN
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('[UPDATE_ENV_VARS_API]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}