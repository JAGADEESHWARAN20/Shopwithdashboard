import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { corsResponse, errorResponse, getCorsHeaders } from "@/lib/api-utils";
import { NextResponse } from "next/server";

export async function OPTIONS(req: Request) {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(req.headers.get("origin")),
    });
  }
export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  const origin = req.headers.get("origin");

  try {
    if (!params.storeId) {
      return errorResponse("Store ID required", origin, 400);
    }

    const categories = await prismadb.category.findMany({
      where: { storeId: params.storeId },
    });

    return corsResponse(categories, origin);
  } catch (err) {
    console.error("[CATEGORIES_GET]", err);
    return errorResponse("Internal error", origin);
  }
}

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  const origin = req.headers.get("origin");

  try {
    const { userId } = await auth();
    if (!userId) return errorResponse("Unauthorized", origin, 401);

    const { name, billboardId } = await req.json();

    if (!name || !billboardId) {
      return errorResponse("Missing fields", origin, 400);
    }

    const store = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    const category = await prismadb.category.create({
      data: { name, billboardId, storeId: params.storeId },
    });

    return corsResponse(category, origin);
  } catch (err) {
    console.error("[CATEGORIES_POST]", err);
    return errorResponse("Internal error", origin);
  }
}