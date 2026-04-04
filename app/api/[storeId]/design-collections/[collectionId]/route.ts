import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

// CORS Helper
function setCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, PATCH, DELETE, OPTIONS");
  return res;
}

export async function GET(req: Request, { params }: { params: { collectionId: string } }) {
  const collection = await prismadb.designCollection.findUnique({
    where: { id: params.collectionId },
    include: { designs: true }
  });
  return setCors(NextResponse.json(collection));
}

export async function PATCH(req: Request, { params }: { params: { collectionId: string } }) {
  const body = await req.json();
  const updated = await prismadb.designCollection.update({
    where: { id: params.collectionId },
    data: body
  });
  return setCors(NextResponse.json(updated));
}

export async function OPTIONS() {
  return setCors(new NextResponse(null, { status: 204 }));
}