import prismadb from "@/lib/prismadb";
import { NextRequest } from "next/server";
import { errorResponse, getCorsHeaders } from "@/lib/api-utils";


function cachedJson(data: unknown, origin: string | null) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      ...getCorsHeaders(origin),
    },
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req.headers.get("origin")),
  });
}

// Variation detail: all variation images + labels for a selected design group.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; slug: string; variationSlug: string }> }
) {
  const origin = req.headers.get("origin");

  try {
    const { storeId, slug, variationSlug } = await params; // ✅ REQUIRED

    if (!storeId || !slug || !variationSlug) {
      return errorResponse("storeId, slug and variationSlug are required", origin, 400);
    }

    const collection = await prismadb.designCollection.findFirst({
      where: {
        storeId: storeId,
        slug: slug,
      },
      include: {
        designs: {
          include: {
            variations: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    if (!collection) {
      return errorResponse("Collection not found", origin, 404);
    }

    const selected = collection.designs.find(
      (design) => slugify(design.title || "other") === variationSlug
    );

    if (!selected) {
      return errorResponse("Variation group not found", origin, 404);
    }

    const items = selected.variations.map((variation) => ({
      id: variation.id,
      label: variation.label,
      value: variation.value,
      imageUrl: variation.imageUrl,
      sortOrder: variation.sortOrder,
    }));

    return cachedJson(
      {
        collection: {
          id: collection.id,
          label: collection.label,
          slug: collection.slug,
        },
        group: {
          id: selected.id,
          label: selected.title,
          imageUrl: selected.imageUrl,
          description: selected.description,
        },
        items,
      },
      origin
    );
  } catch (error) {
    console.error("[SHOWCASE_COLLECTION_VARIATION_GET]", error);
    return errorResponse("Internal error", origin);
  }
}
