import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createMeasurementTemplate, getMeasurements } from "@/lib/data/measurement";

type Params<T> = { params: Promise<T> };

export async function GET(req: NextRequest, { params }: Params<{ storeId: string }>) {
  const { storeId } = await params;
  const items = await getMeasurements(storeId);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest, { params }: Params<{ storeId: string }>) {
  const { userId } = await auth();
  const { storeId } = await params;
  if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

  const store = await prismadb.store.findFirst({ where: { id: storeId, userId } });
  if (!store) return new NextResponse("Unauthorized", { status: 403 });

  const { name, fields } = await req.json();
  if (!name || typeof fields !== "object" || fields === null) {
    return new NextResponse("Invalid payload", { status: 400 });
  }

  const measurement = await createMeasurementTemplate(storeId, { name, fields });
  revalidateTag(`measurements:${storeId}`);
  return NextResponse.json(measurement);
}
