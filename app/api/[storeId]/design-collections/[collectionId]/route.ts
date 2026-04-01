import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: any) {
  const body = await req.json();

  const updated = await prismadb.designCollection.update({
    where: { id: params.collectionId },
    data: body
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: any) {
  const deleted = await prismadb.designCollection.delete({
    where: { id: params.collectionId }
  });

  return NextResponse.json(deleted);
}