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

// Collection detail groups (image3): Front Blouse / Back Blouse / Skirt etc.
export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string; slug: string } }
) {
  const origin = req.headers.get("origin");

  try {
    if (!params.storeId || !params.slug) {
      return errorResponse("storeId and slug are required", origin, 400);
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

    const grouped = new Map<string, {
      label: string;
      variationSlug: string;
      count: number;
      previewImage: string;
    }>();

    for (const design of collection.designs) {
      const key = slugify(design.title || "other");
      if (!grouped.has(key)) {
        grouped.set(key, {
          label: design.title || "Other",
          variationSlug: key,
          count: 1,
          previewImage: design.imageUrl,
        });
      } else {
        grouped.get(key)!.count += 1;
      }
    }

    return corsResponse(
      {
        collection: {
          id: collection.id,
          label: collection.label,
          slug: collection.slug,
          coverImage: collection.coverImage,
        },
        variations: Array.from(grouped.values()),
      },
      origin
    );
  } catch (error) {
    console.error("[SHOWCASE_COLLECTION_BY_SLUG_GET]", error);
    return errorResponse("Internal error", origin);
  }
}
