import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ================= GET SINGLE BILLBOARD =================
export async function GET(
  req: Request,
  { params }: { params: Promise<{ storeId: string; billboardId: string }> }
) {
  try {
    const { storeId, billboardId } = await params;

    if (!storeId || !billboardId) {
      return new NextResponse("storeId and billboardId are required", { status: 400 });
    }

    const billboard = await prismadb.billboard.findFirst({
      where: {
        id: billboardId,
        storeId,
      },
    });

    if (!billboard) {
      return new NextResponse("Billboard not found", { status: 404 });
    }

    return NextResponse.json(billboard);
  } catch (error) {
    console.error("[BILLBOARD_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// ================= UPDATE BILLBOARD =================
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storeId: string; billboardId: string }> }
) {
  try {
    const { storeId, billboardId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!storeId || !billboardId) {
      return new NextResponse("storeId and billboardId are required", { status: 400 });
    }

    const body = await req.json();
    const { label, imageUrl } = body;

    if (!label || !imageUrl) {
      return new NextResponse("Label and imageUrl are required", { status: 400 });
    }

    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const updated = await prismadb.billboard.update({
      where: { id: billboardId },
      data: { label, imageUrl },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[BILLBOARD_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// ================= DELETE BILLBOARD =================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ storeId: string; billboardId: string }> }
) {
  try {
    const { storeId, billboardId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!storeId || !billboardId) {
      return new NextResponse("storeId and billboardId are required", { status: 400 });
    }

    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    await prismadb.billboard.delete({
      where: { id: billboardId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[BILLBOARD_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}