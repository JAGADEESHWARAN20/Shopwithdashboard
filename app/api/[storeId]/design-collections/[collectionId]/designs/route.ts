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

// ================= GET DESIGNS =================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; collectionId: string }> }
<<<<<<< HEAD

=======
>>>>>>> 95f3d2a (new update)
) {
  const origin = req.headers.get("origin");

  try {
    const { storeId, collectionId } = await params;

    if (!storeId || !collectionId) {
      return errorResponse("storeId and collectionId are required", origin, 400);
    }

    const designs = await prismadb.designItem.findMany({
      where: {
        collectionId,
        collection: { storeId },
      },
      include: {
        variations: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
<<<<<<< HEAD

    if (!params.storeId || !params.collectionId) {
      return errorResponse("storeId and collectionId are required", origin, 400);
    }

    const designs = await prismadb.designItem.findMany({
      where: {
        collectionId: params.collectionId,
        collection: {
          storeId: params.storeId,
        },
      },
      include: {
        variations: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },

=======
>>>>>>> 95f3d2a (new update)
    });

    return corsResponse(designs, origin); // ✅ ARRAY
  } catch (error) {
    console.error("[DESIGNS_GET]", error);
<<<<<<< HEAD

=======
>>>>>>> 95f3d2a (new update)
    return errorResponse("Internal error", origin);
  }
}

// ================= CREATE DESIGN =================
export async function POST(
  req: NextRequest,
<<<<<<< HEAD
 { params }: { params: Promise<{ storeId: string; collectionId: string }> }

=======
  { params }: { params: Promise<{ storeId: string; collectionId: string }> }
>>>>>>> 95f3d2a (new update)
) {
  const origin = req.headers.get("origin");

  try {
<<<<<<< HEAD
    const { storeId, collectionId } = await params; // ✅ FIX
=======
    const { storeId, collectionId } = await params;
>>>>>>> 95f3d2a (new update)
    const { userId } = await auth();

    if (!userId) return errorResponse("Unauthorized", origin, 401);

    if (!storeId || !collectionId) {
      return errorResponse("storeId and collectionId are required", origin, 400);
    }

<<<<<<< HEAD
    const { label, imageUrl, description, tags, values, variations } =
      await req.json();

=======
    const body = await req.json();
    const { label, imageUrl, description, tags, values, variations } = body;
>>>>>>> 95f3d2a (new update)

    if (!label || !imageUrl) {
      return errorResponse("label and imageUrl are required", origin, 400);
    }

    // 🔐 check ownership
    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
<<<<<<< HEAD

=======
>>>>>>> 95f3d2a (new update)
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    // 🔎 ensure collection exists
    const collection = await prismadb.designCollection.findFirst({
      where: {
        id: collectionId,
        storeId,
<<<<<<< HEAD

=======
>>>>>>> 95f3d2a (new update)
      },
    });

    if (!collection) {
      return errorResponse("Collection not found", origin, 404);
    }

<<<<<<< HEAD


=======
    // 🔥 normalize variations
>>>>>>> 95f3d2a (new update)
    const normalizedVariations = Array.isArray(variations)
      ? variations
          .filter((v: any) => v?.label && v?.imageUrl)
          .map((v: any, i: number) => ({
            label: String(v.label),
            imageUrl: String(v.imageUrl),
            value: v.value ? String(v.value) : null,
            sortOrder: Number.isFinite(v.sortOrder) ? Number(v.sortOrder) : i,
            isActive: v.isActive !== false,
          }))
      : [];

    const design = await prismadb.designItem.create({
      data: {
<<<<<<< HEAD
        collectionId: collectionId,

=======
        collectionId,
>>>>>>> 95f3d2a (new update)
        title: label,
        imageUrl,
        description,
        tags: Array.isArray(values)
          ? values
          : Array.isArray(tags)
          ? tags
          : [],
        variations: normalizedVariations.length
          ? {
              createMany: {
                data: normalizedVariations,
              },
            }
          : undefined,
      },
      include: {
        variations: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return corsResponse(design, origin);
  } catch (error) {
    console.error("[DESIGNS_POST]", error);
    return errorResponse("Internal error", origin);
  }
}