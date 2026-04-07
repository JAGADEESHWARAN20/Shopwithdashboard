import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { corsResponse, errorResponse, getCorsHeaders } from "@/lib/api-utils";

type Params<T> = { params: Promise<T> };


export async function OPTIONS(req: NextRequest) {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(req.headers.get("origin")),
    });
  }
export async function GET(req: NextRequest, { params }: Params<{ storeId: string }>) {
  const origin = req.headers.get("origin");
const { storeId } = await params;
  try {
    if (!storeId) {
      return errorResponse("Store ID required", origin, 400);
    }

    const categories = await prismadb.category.findMany({
      where: { storeId: storeId },
    });

    return corsResponse(categories, origin);
  } catch (err) {
    console.error("[CATEGORIES_GET]", err);
    return errorResponse("Internal error", origin);
  }
}

export async function POST(
  req: NextRequest,
  { params }: Params<{ storeId: string }> // ✅ FIX
) {
  const origin = req.headers.get("origin");

  try {
    const { storeId } = await params; // ✅ IMPORTANT

    const { userId } = await auth();
    if (!userId) return errorResponse("Unauthorized", origin, 401);

    const { name, billboardId } = await req.json();

    if (!name || !billboardId) {
      return errorResponse("Missing fields", origin, 400);
    }

    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    const category = await prismadb.category.create({
      data: { name, billboardId, storeId },
    });

    return corsResponse(category, origin);
  } catch (err) {
    console.error("[CATEGORIES_POST]", err);
    return errorResponse("Internal error", origin);
  }
}