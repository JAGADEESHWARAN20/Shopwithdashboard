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

// Home page showcase cards (image2): lehanga, gown, etc.
export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  const origin = req.headers.get("origin");

  try {
    if (!params.storeId) {
      return errorResponse("storeId is required", origin, 400);
    }

    const collections = await prismadb.designCollection.findMany({
      where: {
        storeId: params.storeId,
      },
      include: {
        designs: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const payload = collections.map((collection) => ({
      id: collection.id,
      label: collection.label,
      slug: collection.slug,
      previewImage: collection.coverImage,
      designsCount: collection.designs.length,
      href: `/collections/${collection.slug}`,
      variationCount: new Set(collection.designs.map((d) => slugify(d.title || "other"))).size,
    }));

    return corsResponse(payload, origin);
  } catch (error) {
    console.error("[SHOWCASE_COLLECTIONS_GET]", error);
    return errorResponse("Internal error", origin);
  }
}
