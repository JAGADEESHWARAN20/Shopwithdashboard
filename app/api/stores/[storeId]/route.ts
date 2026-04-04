import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getAuth } from "@clerk/nextjs/server";

// 🔁 OPTIONS (Preflight)
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204 });
}

// =====================================================
// ✏️ PATCH STORE
// =====================================================
export async function PATCH(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const body = await req.json();

    const { name, storeUrl, isActive, alternateUrls, logoUrl } = body;

    // 🔎 Check ownership
    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // 🧠 Build update object
    let updatedData: any = {};

    if (name !== undefined) updatedData.name = name;
    if (isActive !== undefined) updatedData.isActive = isActive;
    if (alternateUrls !== undefined) updatedData.alternateUrls = alternateUrls;
    if (logoUrl !== undefined) updatedData.logoUrl = logoUrl;
    if (storeUrl !== undefined) updatedData.storeUrl = storeUrl;

    // 💾 Save update
    const updatedStore = await prismadb.store.update({
      where: { id: params.storeId },
      data: updatedData,
    });

    return NextResponse.json(updatedStore);

  } catch (error: any) {
    console.error("[STORE_PATCH]", error);

    return new NextResponse(`Internal error: ${error.message}`, {
      status: 500,
    });
  }
}

// =====================================================
// 📥 GET STORE
// =====================================================
export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const store = await prismadb.store.findFirst({
      where: { id: params.storeId },
    });

    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    return NextResponse.json(store);

  } catch (error) {
    console.error("[STORE_GET]", error);

    return new NextResponse("Internal error", { status: 500 });
  }
}