import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { collectionId: string } }) {
  const collection = await prismadb.designCollection.findUnique({
    where: { id: params.collectionId },
    include: { designs: true }
  });
  return NextResponse.json(collection);
}

export async function PATCH(req: Request, { params }: { params: { collectionId: string } }) {
  const body = await req.json();
  const updated = await prismadb.designCollection.update({
    where: { id: params.collectionId },
    data: body
  });
  return NextResponse.json(updated);
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204 });
}