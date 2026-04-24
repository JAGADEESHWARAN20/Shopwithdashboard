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

  const body = await req.json();
  const parsedBody = measurementPayloadSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      { message: "Invalid payload", errors: parsedBody.error.flatten() },
      { status: 400 }
    );
  }

  const measurement = await prismadb.measurement.create({
    data: { name: parsedBody.data.name, fields: parsedBody.data.fields, storeId },
  });
  return NextResponse.json(measurement);
}
