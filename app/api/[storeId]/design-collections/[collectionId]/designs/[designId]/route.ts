import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { corsResponse, errorResponse, getCorsHeaders } from "@/lib/api-utils";

export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req.headers.get("origin")),
  });
}

<<<<<<< HEAD
export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string; collectionId: string; designId: string } }
=======
// GET SINGLE DESIGN
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; collectionId: string; designId: string }> }
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16
) {
  const origin = req.headers.get("origin");

  try {
<<<<<<< HEAD
    const design = await prismadb.designItem.findFirst({
      where: {
        id: params.designId,
        collectionId: params.collectionId,
        collection: { storeId: params.storeId },
      },
      include: {
        variations: {
          orderBy: {
            sortOrder: "asc",
          },
        },
=======
    const { storeId, collectionId, designId } = await params;

    const design = await prismadb.designItem.findFirst({
      where: {
        id: designId,
        collectionId,
        collection: { storeId },
      },
      include: {
        variations: { orderBy: { sortOrder: "asc" } },
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16
      },
    });

    if (!design) return errorResponse("Design not found", origin, 404);

    return corsResponse(design, origin);
  } catch (error) {
<<<<<<< HEAD
    console.error("[COLLECTION_DESIGN_GET]", error);
=======
    console.error("[DESIGN_GET]", error);
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16
    return errorResponse("Internal error", origin);
  }
}

<<<<<<< HEAD
export async function PATCH(
  req: NextRequest,
  { params }: { params: { storeId: string; collectionId: string; designId: string } }
=======
// PATCH DESIGN
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; collectionId: string; designId: string }> }
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16
) {
  const origin = req.headers.get("origin");

  try {
<<<<<<< HEAD
    const { userId } =await auth();
    if (!userId) return errorResponse("Unauthorized", origin, 401);

    const { label, imageUrl, description, tags, values, variations } = await req.json();
=======
    const { storeId, collectionId, designId } = await params;
    const { userId } = await auth();

    if (!userId) return errorResponse("Unauthorized", origin, 401);

    const body = await req.json();
    const { label, imageUrl, description, tags, values, variations } = body;
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16

    if (!label || !imageUrl) {
      return errorResponse("label and imageUrl are required", origin, 400);
    }

    const store = await prismadb.store.findFirst({
<<<<<<< HEAD
      where: { id: params.storeId, userId },
=======
      where: { id: storeId, userId },
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

<<<<<<< HEAD
    const existing = await prismadb.designItem.findFirst({
      where: {
        id: params.designId,
        collectionId: params.collectionId,
        collection: { storeId: params.storeId },
      },
    });

    if (!existing) return errorResponse("Design not found", origin, 404);

    const normalizedVariations = Array.isArray(variations)
      ? variations
          .filter((item: any) => item?.label && item?.imageUrl)
          .map((item: any, index: number) => ({
            label: String(item.label),
            imageUrl: String(item.imageUrl),
            value: item.value ? String(item.value) : null,
            sortOrder: Number.isFinite(item.sortOrder) ? Number(item.sortOrder) : index,
            isActive: item.isActive !== false,
          }))
      : [];

    await prismadb.designItem.update({
      where: { id: params.designId },
=======
    const normalizedVariations = Array.isArray(variations)
      ? variations
          .filter((v: any) => v?.label && v?.imageUrl)
          .map((v: any, i: number) => ({
            label: String(v.label),
            imageUrl: String(v.imageUrl),
            value: v.value ? String(v.value) : null,
            sortOrder: Number.isFinite(v.sortOrder) ? v.sortOrder : i,
            isActive: v.isActive !== false,
          }))
      : [];

    // 🔥 SINGLE UPDATE (no double update)
    const updated = await prismadb.designItem.update({
      where: { id: designId },
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16
      data: {
        title: label,
        imageUrl,
        description,
<<<<<<< HEAD
        tags: Array.isArray(values) ? values : Array.isArray(tags) ? tags : [],
        variations: {
          deleteMany: {},
        },
      },
    });

    const updated = await prismadb.designItem.update({
      where: { id: params.designId },
      data: {
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
          orderBy: {
            sortOrder: "asc",
          },
        },
=======
        tags: Array.isArray(values) ? values : tags || [],
        variations: {
          deleteMany: {},
          ...(normalizedVariations.length && {
            createMany: { data: normalizedVariations },
          }),
        },
      },
      include: {
        variations: { orderBy: { sortOrder: "asc" } },
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16
      },
    });

    return corsResponse(updated, origin);
  } catch (error) {
<<<<<<< HEAD
    console.error("[COLLECTION_DESIGN_PATCH]", error);
=======
    console.error("[DESIGN_PATCH]", error);
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16
    return errorResponse("Internal error", origin);
  }
}

<<<<<<< HEAD
export async function DELETE(
  req: NextRequest,
  { params }: { params: { storeId: string; collectionId: string; designId: string } }
=======
// DELETE DESIGN
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; collectionId: string; designId: string }> }
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16
) {
  const origin = req.headers.get("origin");

  try {
<<<<<<< HEAD
    const { userId } =await auth();
    if (!userId) return errorResponse("Unauthorized", origin, 401);

    const store = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
=======
    const { storeId, collectionId, designId } = await params;
    const { userId } = await auth();

    if (!userId) return errorResponse("Unauthorized", origin, 401);

    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    const deleted = await prismadb.designItem.deleteMany({
      where: {
<<<<<<< HEAD
        id: params.designId,
        collectionId: params.collectionId,
        collection: { storeId: params.storeId },
=======
        id: designId,
        collectionId,
        collection: { storeId },
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16
      },
    });

    return corsResponse(deleted, origin);
  } catch (error) {
<<<<<<< HEAD
    console.error("[COLLECTION_DESIGN_DELETE]", error);
    return errorResponse("Internal error", origin);
  }
}
=======
    console.error("[DESIGN_DELETE]", error);
    return errorResponse("Internal error", origin);
  }
}
>>>>>>> b012185edb29a0bd8b2aa6e73625c787f0bcef16
