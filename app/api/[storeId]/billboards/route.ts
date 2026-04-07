import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ================= CREATE BILLBOARD =================
export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
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

    const billboard = await prismadb.billboard.create({
      data: {
        label,
        imageUrl,
        storeId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.error("[BILLBOARDS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// ================= GET ALL BILLBOARDS =================
export async function GET(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const random = searchParams.get("random");

    // 🔥 If random=true → return ONE random billboard
    if (random === "true") {
      const count = await prismadb.billboard.count({
        where: { storeId },
      });

      if (count === 0) return NextResponse.json(null);

      const randomIndex = Math.floor(Math.random() * count);

      const billboard = await prismadb.billboard.findFirst({
        where: { storeId },
        skip: randomIndex,
      });

      return NextResponse.json(billboard);
    }

    // Default → return all
    const billboards = await prismadb.billboard.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(billboards || []);
  } catch (error) {
    console.error("[BILLBOARDS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}