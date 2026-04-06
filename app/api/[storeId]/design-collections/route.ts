import prismadb from "@/lib/prismadb";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { corsResponse, errorResponse, getCorsHeaders } from "@/lib/api-utils";

export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req.headers.get("origin")),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> } // ✅ FIX
) {
  const origin = req.headers.get("origin");

  try {
<<<<<<< HEAD
    const { userId } =await auth();
    if (!userId) return errorResponse("Unauthorized", origin, 401);

    if (!params.storeId) return errorResponse("Store ID required", origin, 400);
=======
    const { storeId } = await params; // ✅ FIX
    const { userId } = await auth(); // ✅ FIX

    if (!userId) return errorResponse("Unauthorized", origin, 401);
    if (!storeId) return errorResponse("Store ID required", origin, 400);
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16

    const { label, coverImage, slug, isFeatured } = await req.json();

    if (!label || !coverImage || !slug) {
      return errorResponse("label, coverImage and slug are required", origin, 400);
    }

    const store = await prismadb.store.findFirst({
<<<<<<< HEAD
      where: { id: params.storeId, userId },
=======
      where: { id: storeId, userId },
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    const collection = await prismadb.designCollection.create({
      data: {
        label,
        coverImage,
        slug,
        isFeatured: Boolean(isFeatured),
<<<<<<< HEAD
        storeId: params.storeId,
=======
        storeId,
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16
      },
    });

    return corsResponse(collection, origin);
  } catch (error) {
    console.error("[COLLECTIONS_POST]", error);
    return errorResponse("Internal Server Error", origin);
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const origin = req.headers.get("origin");

  try {
<<<<<<< HEAD
    if (!params.storeId) return errorResponse("Store ID required", origin, 400);
=======
    const { storeId } = await params;
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16

    const collections = await prismadb.designCollection.findMany({
      where: { storeId },
      include: {
        designs: {
          include: {
            variations: {
<<<<<<< HEAD
              orderBy: {
                sortOrder: "asc",
              },
=======
              orderBy: { sortOrder: "asc" },
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16
            },
          },
        },
      },
<<<<<<< HEAD
      orderBy: {
        createdAt: "desc",
      },
    });

    return corsResponse(collections, origin);
  } catch (error) {
    console.error("[COLLECTIONS_GET]", error);
=======
      orderBy: { createdAt: "desc" },
    });

    return corsResponse(collections, origin); // ✅ ARRAY
  } catch (error) {
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16
    return errorResponse("Internal Server Error", origin);
  }
}
