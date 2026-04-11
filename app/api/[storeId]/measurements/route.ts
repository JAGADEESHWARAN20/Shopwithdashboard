import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

type Params<T> = { params: Promise<T> };

export async function GET(req: NextRequest, { params }: Params<{ storeId: string }>) {
  const { storeId } = await params;
  const items = await prismadb.measurement.findMany({ where: { storeId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest, { params }: Params<{ storeId: string }>) {
  const { userId } = await auth();
  const { storeId } = await params;
  if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
  const store = await prismadb.store.findFirst({ where: { id: storeId, userId } });
  if (!store) return new NextResponse("Unauthorized", { status: 403 });

  const { name, fields } = await req.json();
  if (!name || !Array.isArray(fields)) return new NextResponse("Invalid payload", { status: 400 });

  const measurement = await prismadb.measurement.create({ data: { name, fields, storeId } });
  return NextResponse.json(measurement);
}
