import prismadb from "@/lib/prismadb";
import { NextRequest } from "next/server";
import { corsResponse, errorResponse, getCorsHeaders } from "@/lib/api-utils";

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

// Variation detail: all design items for one variation in a collection.
export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string; slug: string; variationSlug: string } }
) {
  const origin = req.headers.get("origin");

  try {
    if (!params.storeId || !params.slug || !params.variationSlug) {
      return errorResponse("storeId, slug and variationSlug are required", origin, 400);
    }

    const collection = await prismadb.designCollection.findFirst({
      where: {
        storeId: params.storeId,
        slug: params.slug,
      },
      include: {
        designs: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!collection) {
      return errorResponse("Collection not found", origin, 404);
    }

    const designs = collection.designs.filter(
      (design) => slugify(design.title || "other") === params.variationSlug
    );

    return corsResponse(
      {
        collection: {
          id: collection.id,
          label: collection.label,
          slug: collection.slug,
        },
        variationSlug: params.variationSlug,
        variationLabel: designs[0]?.title || "Other",
        items: designs,
      },
      origin
    );
  } catch (error) {
    console.error("[SHOWCASE_COLLECTION_VARIATION_GET]", error);
    return errorResponse("Internal error", origin);
  }
}
