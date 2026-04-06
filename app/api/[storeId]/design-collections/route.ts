import prismadb from "@/lib/prismadb";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { corsResponse, errorResponse, getCorsHeaders } from "@/lib/api-utils";

export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req.headers.get("origin")),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  const origin = req.headers.get("origin");

  try {
    const { userId } = await auth();
    if (!userId) return errorResponse("Unauthorized", origin, 401);

    if (!params.storeId) return errorResponse("Store ID required", origin, 400);

    const { label, coverImage, slug, isFeatured } = await req.json();

    if (!label || !coverImage || !slug) {
      return errorResponse("label, coverImage and slug are required", origin, 400);
    }

    const store = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    const collection = await prismadb.designCollection.create({
      data: {
        label,
        coverImage,
        slug,
        isFeatured: Boolean(isFeatured),
        storeId: params.storeId,
      },
    });

    return corsResponse(collection, origin);
  } catch (error) {
    console.error("[COLLECTIONS_POST]", error);
    return errorResponse("Internal Server Error", origin);
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  const origin = req.headers.get("origin");

  try {
    if (!params.storeId) return errorResponse("Store ID required", origin, 400);

    const collections = await prismadb.designCollection.findMany({
      where: {
        storeId: params.storeId,
      },
      include: {
        designs: {
          include: {
            variations: {
              orderBy: {
                sortOrder: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return corsResponse(collections, origin);
  } catch (error) {
    console.error("[COLLECTIONS_GET]", error);
    return errorResponse("Internal Server Error", origin);
  }
}
