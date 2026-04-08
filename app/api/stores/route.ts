import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export async function GET(req: NextRequest) {
  try {
    const stores = await prismadb.store.findMany();
    return NextResponse.json(stores);
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const { name } = await req.json();

    const store = await prismadb.store.create({
      data: { name, userId },
    });

    return NextResponse.json(store);
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
}