import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

type Params<T> = { params: Promise<T> };

// ================= GET =================
export async function GET(
  req: NextRequest,
  { params }: Params<{ storeId: string; sizeId: string }>
) {
  try {
    const { storeId, sizeId } = await params;

    if (!sizeId)
      return new NextResponse("Size Id is required", { status: 400 });

    if (!storeId)
      return new NextResponse("Store ID is required", { status: 400 });

    const size = await prismadb.size.findFirst({
      where: { id: sizeId, storeId },
    });

    return NextResponse.json(size);
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
}

// ================= PATCH =================
export async function PATCH(
  req: NextRequest,
  { params }: Params<{ storeId: string; sizeId: string }>
) {
  try {
    const { storeId, sizeId } = await params;
    const { userId } = await auth();
    const body = await req.json();
    const { name, value } = body;

    if (!userId)
      return new NextResponse("Unauthorized", { status: 401 });

    if (!name)
      return new NextResponse("Name is required", { status: 400 });

    if (!value)
      return new NextResponse("Value is required", { status: 400 });

    if (!sizeId)
      return new NextResponse("Size id is required", { status: 400 });

    if (!storeId)
      return new NextResponse("Store ID is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId)
      return new NextResponse("Unauthorized", { status: 403 });

    const size = await prismadb.size.updateMany({
      where: { id: sizeId, storeId },
      data: { name, value },
    });

    return NextResponse.json(size);
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
}

// ================= DELETE =================
export async function DELETE(
  req: NextRequest,
  { params }: Params<{ storeId: string; sizeId: string }>
) {
  try {
    const { storeId, sizeId } = await params;
    const { userId } = await auth();

    if (!userId)
      return new NextResponse("Unauthorized", { status: 401 });

    if (!sizeId)
      return new NextResponse("Size Id is required", { status: 400 });

    if (!storeId)
      return new NextResponse("Store ID is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId)
      return new NextResponse("Unauthorized", { status: 403 });

    const size = await prismadb.size.deleteMany({
      where: { id: sizeId, storeId },
    });

    return NextResponse.json(size);
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
}
