import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: any) {
  const count = await prismadb.designCollection.count({
    where: { storeId: params.storeId },
  });

  const response = NextResponse.json(count);
  
  response.headers.set("Access-Control-Allow-Origin", "*"); 
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}