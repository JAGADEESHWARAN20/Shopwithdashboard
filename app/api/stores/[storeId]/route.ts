import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getAuth } from "@clerk/nextjs/server";

// 🌐 CORS helper
function setCorsHeaders(response: NextResponse, origin: string | null) {
  response.headers.set("Access-Control-Allow-Origin", origin || "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// 🔁 OPTIONS (Preflight)
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");

  return setCorsHeaders(
    new NextResponse(null, { status: 204 }),
    origin
  );
}

// =====================================================
// ✏️ PATCH STORE
// =====================================================
export async function PATCH(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  const origin = req.headers.get("origin");

  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return setCorsHeaders(
        new NextResponse("Unauthenticated", { status: 401 }),
        origin
      );
    }

    if (!params.storeId) {
      return setCorsHeaders(
        new NextResponse("Store ID is required", { status: 400 }),
        origin
      );
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
      return setCorsHeaders(
        new NextResponse("Unauthorized", { status: 403 }),
        origin
      );
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

    return setCorsHeaders(
      NextResponse.json(updatedStore),
      origin
    );

  } catch (error: any) {
    console.error("[STORE_PATCH]", error);

    return setCorsHeaders(
      new NextResponse(`Internal error: ${error.message}`, {
        status: 500,
      }),
      origin
    );
  }
}

// =====================================================
// 📥 GET STORE
// =====================================================
export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  const origin = req.headers.get("origin");

  try {
    if (!params.storeId) {
      return setCorsHeaders(
        new NextResponse("Store ID is required", { status: 400 }),
        origin
      );
    }

    const store = await prismadb.store.findFirst({
      where: { id: params.storeId },
    });

    if (!store) {
      return setCorsHeaders(
        new NextResponse("Store not found", { status: 404 }),
        origin
      );
    }

    return setCorsHeaders(
      NextResponse.json(store),
      origin
    );

  } catch (error) {
    console.error("[STORE_GET]", error);

    return setCorsHeaders(
      new NextResponse("Internal error", { status: 500 }),
      origin
    );
  }
}