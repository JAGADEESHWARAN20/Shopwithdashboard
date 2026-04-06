import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { corsResponse, errorResponse } from "@/lib/api-utils";

export async function GET(req: Request,{ params }: { params: Promise<{ storeId: string, categoryId: string }> }) {
  const origin = req.headers.get("origin");
  const { storeId, categoryId } = await params;

  try {
    const category = await prismadb.category.findUnique({
      where: { id: categoryId },
      include: { billboard: true },
    });

    return corsResponse(category, origin);
  } catch (err) {
    console.error("[CATEGORY_GET]", err);
    return errorResponse("Internal error", origin);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storeId: string; categoryId: string }> }
) {
  const origin = req.headers.get("origin");

  try {
    const { userId } = await auth();
    if (!userId) return errorResponse("Unauthorized", origin, 401);

    const { name, billboardId } = await req.json();

    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    const updated = await prismadb.category.update({
      where: { id: categoryId },
      data: { name, billboardId },
    });

    return corsResponse(updated, origin);
  } catch (err) {
    console.error("[CATEGORY_PATCH]", err);
    return errorResponse("Internal error", origin);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ storeId: string; categoryId: string }> }
) {
  const origin = req.headers.get("origin");

  try {
    const { userId } = await auth();
    if (!userId) return errorResponse("Unauthorized", origin, 401);

    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    await prismadb.category.delete({
      where: { id: categoryId },
    });

    return corsResponse({ success: true }, origin);
  } catch (err) {
    console.error("[CATEGORY_DELETE]", err);
    return errorResponse("Internal error", origin);
  }
}