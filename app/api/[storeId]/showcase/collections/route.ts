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

export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req.headers.get("origin")),
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const origin = req.headers.get("origin");

  try {
    const { storeId } = await params; // ✅ FIX

    if (!storeId) {
      return errorResponse("storeId is required", origin, 400);
    }

    const collections = await prismadb.designCollection.findMany({
      where: { storeId },
      include: {
        designs: {
          include: {
            variations: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const payload = collections.map((collection) => ({
      id: collection.id,
      label: collection.label,
      slug: collection.slug,
      previewImage: collection.coverImage,
      designsCount: collection.designs.reduce(
        (sum, d) => sum + d.variations.length,
        0
      ),
      href: `/collections/${collection.slug}`,
      variationCount: collection.designs.length,
    }));

    return cachedJson(payload, origin);
  } catch (error) {
    console.error("[SHOWCASE_COLLECTIONS_GET]", error);
    return errorResponse("Internal error", origin);
  }
}