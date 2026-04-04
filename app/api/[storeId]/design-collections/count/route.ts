import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: any) {
  const count = await prismadb.designCollection.count({
    where: { storeId: params.storeId },
  });

  const response = NextResponse.json(count);
  
  // Add these lines to fix the "Fetch failed" errors in the browser
  response.headers.set("Access-Control-Allow-Origin", "*"); 
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  
  return response;
}