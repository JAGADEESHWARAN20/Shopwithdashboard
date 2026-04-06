import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { corsResponse, errorResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";


export async function GET(req: Request, { params }: any) {
  const origin = req.headers.get("origin");

  try {
    const store = await prismadb.store.findFirst({
      where: { id: params.storeId },
    });

    if (!store) return errorResponse("Store not found", origin, 404);

    return corsResponse(store, origin);
  } catch (err) {
    console.error("[STORE_GET]", err);
    return errorResponse("Internal error", origin);
  }
}



export async function PATCH(req: NextRequest, { params }: any){
  const origin = req.headers.get("origin");

  try {
    const { userId } = await auth();
    if (!userId) return errorResponse("Unauthorized", origin, 401);

    const body = await req.json();

    const store = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!store) return errorResponse("Unauthorized", origin, 403);

    const updated = await prismadb.store.update({
      where: { id: params.storeId },
      data: body,
    });

    return corsResponse(updated, origin);
  } catch (err: any) {
    console.error("[STORE_PATCH]", err);
    return errorResponse(err.message || "Internal error", origin);
  }
}