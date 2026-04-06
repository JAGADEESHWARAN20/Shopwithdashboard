import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
<<<<<<< HEAD
<<<<<<< HEAD
import { corsResponse, errorResponse } from "@/lib/api-utils";
=======
>>>>>>> 95f3d2a (new update)
=======
>>>>>>> 95f3d2a (new update)
import { NextRequest } from "next/server";
import { corsResponse, errorResponse, getCorsHeaders } from "@/lib/api-utils";

// ================= OPTIONS =================
export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req.headers.get("origin")),
  });
}

<<<<<<< HEAD
<<<<<<< HEAD
export async function GET(req: Request, { params }: any) {
  const origin = req.headers.get("origin");

// =========================
// GET STORE
// =========================
=======
// ================= GET STORE =================
>>>>>>> 95f3d2a (new update)
=======
// ================= GET STORE =================
>>>>>>> 95f3d2a (new update)
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
<<<<<<< HEAD
<<<<<<< HEAD
    const { userId } =await auth();
    if (!userId) return errorResponse("Unauthorized", origin, 401);
    const { userId } = await auth(); // ✅ FIX
=======
    const { storeId } = await params;
    const { userId } = await auth();

>>>>>>> 95f3d2a (new update)
=======
    const { storeId } = await params;
    const { userId } = await auth();

>>>>>>> 95f3d2a (new update)
    if (!userId) {
      return errorResponse("Unauthorized", origin, 401);
    }

<<<<<<< HEAD
<<<<<<< HEAD
    const { storeId } = await params; // ✅ FIX
    const { userId } = await auth();
    if (!userId) return errorResponse("Unauthorized", origin, 401);

=======
    if (!storeId) {
      return errorResponse("Store ID required", origin, 400);
    }
>>>>>>> 95f3d2a (new update)
=======
    if (!storeId) {
      return errorResponse("Store ID required", origin, 400);
    }
>>>>>>> 95f3d2a (new update)

    const body = await req.json();
    const { name, storeUrl, isActive, alternateUrls, logoUrl } = body;

    // 🔐 Ownership check
    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!store) {
      return errorResponse("Unauthorized", origin, 403);
    }

    // 🧠 Update only provided fields
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