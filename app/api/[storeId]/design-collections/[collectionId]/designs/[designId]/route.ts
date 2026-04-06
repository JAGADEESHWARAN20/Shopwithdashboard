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

// ================= GET DESIGN =================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; collectionId: string; designId: string }> }
) {
  const origin = req.headers.get("origin");

  try {
    const { storeId, collectionId, designId } = await params;

    const design = await prismadb.designItem.findFirst({
      where: {
        id: designId,
        collectionId,
        collection: { storeId },
      },
      include: {
        variations: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!design) return errorResponse("Design not found", origin, 404);

    return corsResponse(design, origin);
  } catch (error) {
    console.error("[DESIGN_GET]", error);
    return errorResponse("Internal error", origin);
  }
}

// ================= PATCH DESIGN =================
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; collectionId: string; designId: string }> }
) {
  const origin = req.headers.get("origin");

  try {
    const { storeId, collectionId, designId } = await params;
    const { userId } = await auth();

    if (!userId) return errorResponse("Unauthorized", origin, 401);

    const body = await req.json();
    const { label, imageUrl, description, tags, values, variations } = body;

    if (!label || !imageUrl) {
      return errorResponse("label and imageUrl are required", origin, 400);
    }

    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    const existing = await prismadb.designItem.findFirst({
      where: {
        id: designId,
        collectionId,
        collection: { storeId },
      },
    });

    if (!existing) return errorResponse("Design not found", origin, 404);

    // normalize variations
    const normalizedVariations = Array.isArray(variations)
      ? variations
          .filter((v: any) => v?.label && v?.imageUrl)
          .map((v: any, index: number) => ({
            label: String(v.label),
            imageUrl: String(v.imageUrl),
            value: v.value ? String(v.value) : null,
            sortOrder: index,
            isActive: true,
          }))
      : [];

    // delete old variations
    await prismadb.designVariation.deleteMany({
      where: { designItemId: designId },
    });

    // single clean update
    const updated = await prismadb.designItem.update({
      where: { id: designId },
      data: {
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

    return corsResponse(updated, origin);
  } catch (error) {
    console.error("[DESIGN_PATCH]", error);
    return errorResponse("Internal error", origin);
  }
}

// ================= DELETE =================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; collectionId: string; designId: string }> }
) {
  const origin = req.headers.get("origin");

  try {
    const { storeId, collectionId, designId } = await params;
    const { userId } = await auth();

    if (!userId) return errorResponse("Unauthorized", origin, 401);

    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    await prismadb.designItem.delete({
      where: { id: designId },
    });

    return corsResponse({ success: true }, origin);
  } catch (error) {
    console.error("[DESIGN_DELETE]", error);
    return errorResponse("Internal error", origin);
  }
}