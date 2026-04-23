import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

type Params<T> = { params: Promise<T> };

export async function GET(req: NextRequest, { params }: Params<{ measurementId: string }>) {
  const { measurementId } = await params;
  const measurement = await prismadb.measurement.findUnique({ where: { id: measurementId } });
  return NextResponse.json(measurement);
}

export async function PATCH(req: NextRequest, { params }: Params<{ storeId: string; measurementId: string }>) {
  const { userId } = await auth();
  const { storeId, measurementId } = await params;
  if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
  const store = await prismadb.store.findFirst({ where: { id: storeId, userId } });
  if (!store) return new NextResponse("Unauthorized", { status: 403 });

  const { name, fields } = await req.json();
  const measurement = await prismadb.measurement.update({ where: { id: measurementId }, data: { name, fields } });
  revalidateTag(`measurements:${storeId}`);
  return NextResponse.json(measurement);
}

export async function DELETE(req: NextRequest, { params }: Params<{ storeId: string; measurementId: string }>) {
  const { userId } = await auth();
  const { storeId, measurementId } = await params;
  if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
  const store = await prismadb.store.findFirst({ where: { id: storeId, userId } });
  if (!store) return new NextResponse("Unauthorized", { status: 403 });

  await prismadb.measurement.delete({ where: { id: measurementId } });
  revalidateTag(`measurements:${storeId}`);
  return NextResponse.json({ success: true });
}
