import { auth, currentUser } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId: clerkId } = await auth();
  const clerkUser = await currentUser();

  if (!clerkId || !clerkUser) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  let user = await prismadb.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    user = await prismadb.user.create({
      data: {
        clerkId,
        email,
        name: clerkUser.fullName,
        image: clerkUser.imageUrl,
        provider: clerkUser.externalAccounts?.length ? "google" : "email",
        isProfileComplete: false,
      },
    });
  }

  return NextResponse.json(user);
}