import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

export async function getCurrentUser() {
  const { userId: clerkId } = await auth();

  if (!clerkId) return null;

  const user = await prismadb.user.findUnique({
    where: { clerkId },
  });

  return user;
}