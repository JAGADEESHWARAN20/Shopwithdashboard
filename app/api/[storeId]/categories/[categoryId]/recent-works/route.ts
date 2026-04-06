import prismadb from "@/lib/prismadb";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { corsResponse, errorResponse, getCorsHeaders } from "@/lib/api-utils";

// ================= OPTIONS =================
export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req.headers.get("origin")),
  });
}

// ================= CREATE COLLECTION =================
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const origin = req.headers.get("origin");

  try {
    const { storeId } = await params;
    const { userId } = await auth();

    if (!userId) return errorResponse("Unauthorized", origin, 401);
    if (!storeId) return errorResponse("Store ID required", origin, 400);

    const body = await req.json();
    const { label, coverImage, slug, isFeatured } = body;

    if (!label || !coverImage || !slug) {
      return errorResponse(
        "label, coverImage and slug are required",
        origin,
        400
      );
    }

    // 🔐 Ownership check
    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    const collection = await prismadb.designCollection.create({
      data: {
        label,
        coverImage,
        slug,
        isFeatured: Boolean(isFeatured),
        storeId,
      },
    });

    return corsResponse(collection, origin);
  } catch (error) {
    console.error("[COLLECTIONS_POST]", error);
    return errorResponse("Internal Server Error", origin);
  }
}

// ================= GET ALL COLLECTIONS =================
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

    const collections = await prismadb.designCollection.findMany({
      where: { storeId },
      include: {
        designs: {
          include: {
            variations: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // ✅ ALWAYS ARRAY
    return corsResponse(Array.isArray(collections) ? collections : [], origin);
  } catch (error) {
    console.error("[COLLECTIONS_GET]", error);
    return errorResponse("Internal Server Error", origin);
  }
}

