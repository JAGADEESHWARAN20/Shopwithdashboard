// app/api/stores/[storeId]/activate.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest, { params }: { params: { storeId: string } }) {
     const { storeId } = params;

     try {
          const body = await req.json();
          const { isActive } = body;

          if (!storeId) {
               return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
          }

          if (typeof isActive !== 'boolean') {
               return NextResponse.json({ error: 'isActive is required' }, { status: 400 });
          }

          const store = await prisma.store.update({
               where: { id: storeId },
               data: { isActive },
          });

          // Generate store URL
          const storeUrl = `https://${store.name.toLowerCase()}.ecommercestore-online.vercel.app`;

          // Update store with storeUrl
          const updatedStore = await prisma.store.update({
               where: { id: storeId },
               data: { storeUrl },
          });

          return NextResponse.json(updatedStore);

     } catch (error) {
          console.error('Error updating store activation:', error);
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }
}