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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; slug: string }> }
) {
  const origin = req.headers.get("origin");

  try {
    const { storeId, slug } = await params; // ✅ FIX

    if (!storeId || !slug) {
      return errorResponse("storeId and slug are required", origin, 400);
    }

    const collection = await prismadb.designCollection.findFirst({
      where: { storeId, slug },
      include: {
        designs: {
          include: {
            variations: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!collection) {
      return errorResponse("Collection not found", origin, 404);
    }

    const variations = collection.designs.map((design) => ({
      id: design.id,
      label: design.title,
      variationSlug: slugify(design.title || "other"),
      previewImage: design.imageUrl,
      count: design.variations.length,
      href: `/collections/${collection.slug}/${slugify(design.title || "other")}`,
    }));

    return cachedJson(
      {
        collection: {
          id: collection.id,
          label: collection.label,
          slug: collection.slug,
          coverImage: collection.coverImage,
        },
        variations,
      },
      origin
    );
  } catch (error) {
    console.error("[SHOWCASE_COLLECTION_BY_SLUG_GET]", error);
    return errorResponse("Internal error", origin);
  }
}