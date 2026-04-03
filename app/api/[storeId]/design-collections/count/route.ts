import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: any) {
  const count = await prismadb.designCollection.count({
    where: {
      storeId: params.storeId,
    },
  });

  return NextResponse.json(count);
}