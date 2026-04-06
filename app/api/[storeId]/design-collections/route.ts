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
<<<<<<< HEAD

    const { userId } = await auth();
    if (!userId) return errorResponse("Unauthorized", origin, 401);

    if (!params.storeId) return errorResponse("Store ID required", origin, 400);

=======
    const { storeId } = await params;
    const { userId } = await auth();

    if (!userId) return errorResponse("Unauthorized", origin, 401);
    if (!storeId) return errorResponse("Store ID required", origin, 400);
>>>>>>> 95f3d2a (new update)
=======
>>>>>>> 95f3d2a (new update)

    const { label, coverImage, slug, isFeatured } = await req.json();

    if (!label || !coverImage || !slug) {
      return errorResponse(
        "label, coverImage and slug are required",
        origin,
        400
      );
    }

    // 🔐 ownership check
    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> 95f3d2a (new update)
=======
>>>>>>> 95f3d2a (new update)
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    const collection = await prismadb.designCollection.create({
      data: {
        label,
        coverImage,
        slug,
        isFeatured: Boolean(isFeatured),
        storeId,
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> 95f3d2a (new update)
=======
>>>>>>> 95f3d2a (new update)
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
<<<<<<< HEAD
<<<<<<< HEAD

    const { storeId } = await params;

    if (!params.storeId) return errorResponse("Store ID required", origin, 400);

=======
    const { storeId } = await params;

    if (!storeId) {
      return errorResponse("Store ID required", origin, 400);
    }
>>>>>>> 95f3d2a (new update)
=======
    const { storeId } = await params;

    if (!storeId) {
      return errorResponse("Store ID required", origin, 400);
    }
>>>>>>> 95f3d2a (new update)

    const collections = await prismadb.designCollection.findMany({
      where: { storeId },
      include: {
        designs: {
          include: {
            variations: {
<<<<<<< HEAD
<<<<<<< HEAD
              orderBy: { sortOrder: "asc" }

=======
              orderBy: { sortOrder: "asc" },
>>>>>>> 95f3d2a (new update)
=======
              orderBy: { sortOrder: "asc" },
>>>>>>> 95f3d2a (new update)
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

<<<<<<< HEAD
<<<<<<< HEAD
    return corsResponse(collections, origin); // ✅ ARRAY
  } catch (error) {

      orderBy: {
        createdAt: "desc",
      },
    });

    return corsResponse(collections, origin);
  } catch (error) {
    console.error("[COLLECTIONS_GET]", error);

=======
    return corsResponse(collections, origin); // ✅ ALWAYS ARRAY
  } catch (error) {
    console.error("[COLLECTIONS_GET]", error);
>>>>>>> 95f3d2a (new update)
=======
    return corsResponse(collections, origin); // ✅ ALWAYS ARRAY
  } catch (error) {
    console.error("[COLLECTIONS_GET]", error);
>>>>>>> 95f3d2a (new update)
    return errorResponse("Internal Server Error", origin);
  }
}