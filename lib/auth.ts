// lib/auth.ts
import { getAuth } from '@clerk/nextjs/server';
import prismadb from '@/lib/prismadb';
import type { CustomRequest } from './types';

export async function getUserStore(req: CustomRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    return { userId: null, store: null };
  }

  const store = await prismadb.store.findFirst({
    where: { userId },
  });

  return { userId, store };
}
