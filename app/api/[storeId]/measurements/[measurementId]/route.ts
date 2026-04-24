import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

type Params<T> = { params: Promise<T> };
const measurementPayloadSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  fields: z
    .array(
      z.object({
        key: z.string().trim().min(1, "Field key is required."),
        label: z.string().trim().min(1, "Field label is required."),
        unit: z.string().trim().optional().default(""),
      })
    )
    .min(1, "At least one field is required."),
});

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

  const body = await req.json();
  const parsedBody = measurementPayloadSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      { message: "Invalid payload", errors: parsedBody.error.flatten() },
      { status: 400 }
    );
  }

  const measurement = await prismadb.measurement.update({
    where: { id: measurementId },
    data: { name: parsedBody.data.name, fields: parsedBody.data.fields },
  });
  return NextResponse.json(measurement);
}

export async function DELETE(req: NextRequest, { params }: Params<{ storeId: string; measurementId: string }>) {
  const { userId } = await auth();
  const { storeId, measurementId } = await params;
  if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
  const store = await prismadb.store.findFirst({ where: { id: storeId, userId } });
  if (!store) return new NextResponse("Unauthorized", { status: 403 });

  await prismadb.measurement.delete({ where: { id: measurementId } });
  return NextResponse.json({ success: true });
}
