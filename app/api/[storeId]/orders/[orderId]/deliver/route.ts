import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

type Params<T> = { params: Promise<T> };

export async function PATCH(req: NextRequest, { params }: Params<{ storeId: string; orderId: string }>) {
  const { userId } = await auth();
  const { storeId, orderId } = await params;
  if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

  const store = await prismadb.store.findFirst({ where: { id: storeId, userId } });
  if (!store) return new NextResponse("Unauthorized", { status: 403 });

  const order = await prismadb.order.update({ where: { id: orderId }, data: { deliveredTime: new Date() } });
  return NextResponse.json(order);
}
