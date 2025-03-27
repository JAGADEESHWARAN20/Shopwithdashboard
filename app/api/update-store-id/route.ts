import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
     try {
          const { storeId } = await req.json();
          const vercelToken = process.env.VERCEL_API_TOKEN; // Set this in your .env.local

          if (!vercelToken) {
               return NextResponse.json({ error: 'Vercel API token not found' }, { status: 500 });
          }

          const response = await fetch(
               `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/env?target=production`,
               {
                    method: 'PATCH',
                    headers: {
                         Authorization: `Bearer ${vercelToken}`,
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                         value: storeId,
                         key: 'NEXT_PUBLIC_STORE_ID',
                    }),
               }
          );

          if (!response.ok) {
               const errorData = await response.json();
               return NextResponse.json({ error: `Vercel API error: ${JSON.stringify(errorData)}` }, { status: 500 });
          }

          return NextResponse.json({ message: 'Store ID updated successfully' });
     } catch (error) {
          console.error('[UPDATE_STORE_ID_API]', error);
          return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
     }
}