import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { corsResponse, errorResponse } from "@/lib/api-utils";

// ================= GET CATEGORY =================
export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ storeId: string; categoryId: string }>;
  }
) {
  const origin = req.headers.get("origin");

  try {
    const { storeId, categoryId } = await params;

    if (!storeId || !categoryId) {
      return errorResponse("storeId and categoryId are required", origin, 400);
    }

    const category = await prismadb.category.findUnique({
      where: { id: categoryId },
      include: { billboard: true },
    });

    if (!category) {
      return errorResponse("Category not found", origin, 404);
    }

    return corsResponse(category, origin);
  } catch (err) {
    console.error("[CATEGORY_GET]", err);
    return errorResponse("Internal error", origin);
  }
}

// ================= PATCH CATEGORY =================
export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ storeId: string; categoryId: string }>;
  }
) {
  const origin = req.headers.get("origin");

  try {
    const { storeId, categoryId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return errorResponse("Unauthorized", origin, 401);
    }

    if (!storeId || !categoryId) {
      return errorResponse("storeId and categoryId are required", origin, 400);
    }

    const body = await req.json();
    const { name, billboardId } = body;

    if (!name || !billboardId) {
      return errorResponse("Missing required fields", origin, 400);
    }

    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!store) {
      return errorResponse("Unauthorized", origin, 403);
    }

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

// ================= DELETE CATEGORY =================
export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ storeId: string; categoryId: string }>;
  }
) {
  const origin = req.headers.get("origin");

  try {
    const { storeId, categoryId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return errorResponse("Unauthorized", origin, 401);
    }

    if (!storeId || !categoryId) {
      return errorResponse("storeId and categoryId are required", origin, 400);
    }

    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!store) {
      return errorResponse("Unauthorized", origin, 403);
    }

    await prismadb.category.delete({
      where: { id: categoryId },
    });

    return corsResponse({ success: true }, origin);
  } catch (err) {
    console.error("[CATEGORY_DELETE]", err);
    return errorResponse("Internal error", origin);
  }
}