import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    const clerkUser = await currentUser();

    if (!clerkId || !clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";

    let user = await prismadb.user.findFirst({
      where: { clerkId },
      include: {
        wallet: true,
        cart: true,
      },
    });

    if (user) {
      return NextResponse.json(user);
    }

    user = await prismadb.user.create({
      data: {
        clerkId,
        email,
        name: clerkUser.fullName ?? "",
        image: clerkUser.imageUrl ?? "",
        provider:
          clerkUser.externalAccounts?.length > 0 ? "google" : "email",

        wallet: {
          create: { balance: 0 },
        },

        cart: {
          create: {},
        },
      },
      include: {
        wallet: true,
        cart: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_CREATE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}