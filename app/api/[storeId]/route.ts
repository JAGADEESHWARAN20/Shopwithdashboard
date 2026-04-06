import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { corsResponse, errorResponse, getCorsHeaders } from "@/lib/api-utils";

// ================= OPTIONS =================
export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req.headers.get("origin")),
  });
}

// ================= GET STORE =================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const origin = req.headers.get("origin");

  try {
    const { storeId } = await params;

    if (!storeId) {
      return errorResponse("Store ID required", origin, 400);
    }

    const store = await prismadb.store.findFirst({
      where: { id: storeId },
    });

    if (!store) {
      return errorResponse("Store not found", origin, 404);
    }

    return corsResponse(store, origin);
  } catch (error) {
    console.error("[STORE_GET]", error);
    return errorResponse("Internal error", origin);
  }
}

// ================= PATCH STORE =================
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const origin = req.headers.get("origin");

  try {
    const { storeId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return errorResponse("Unauthorized", origin, 401);
    }

    if (!storeId) {
      return errorResponse("Store ID required", origin, 400);
    }

    const body = await req.json();
    const { name, storeUrl, isActive, alternateUrls, logoUrl } = body;

    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!store) {
      return errorResponse("Unauthorized", origin, 403);
    }

    const updated = await prismadb.store.update({
      where: { id: storeId },
      data: {
        ...(name !== undefined && { name }),
        ...(storeUrl !== undefined && { storeUrl }),
        ...(isActive !== undefined && { isActive }),
        ...(alternateUrls !== undefined && { alternateUrls }),
        ...(logoUrl !== undefined && { logoUrl }),
      },
    });

    return corsResponse(updated, origin);
  } catch (error) {
    console.error("[STORE_PATCH]", error);
    return errorResponse("Internal error", origin);
  }
}