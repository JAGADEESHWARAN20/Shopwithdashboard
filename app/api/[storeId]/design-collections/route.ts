import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";


export async function POST(req: Request, { params }: any) {
  const body = await req.json();

  const collection = await prismadb.designCollection.create({
    data: {
      ...body,
      storeId: params.storeId
    }
  });

  return NextResponse.json(collection);
}


export async function GET(_: Request, { params }: any) {
  try {
    const collections = await prismadb.designCollection.findMany({
      where: {
        storeId: params.storeId,
      },
      include: {
        designs: true, 
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error("[COLLECTIONS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}