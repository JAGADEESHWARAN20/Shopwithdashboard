import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
<<<<<<< HEAD
=======
import { corsResponse, errorResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";


export async function GET(req: Request, { params }: any) {
  const origin = req.headers.get("origin");
>>>>>>> codex/create-api-for-adding-designs-to-collection-waqk9m

// =========================
// GET STORE
// =========================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;

    const store = await prismadb.store.findFirst({
      where: { id: storeId },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error("[STORE_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// =========================
// PATCH STORE
// =========================
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
<<<<<<< HEAD
    const { userId } = await auth(); // ✅ FIX
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const { storeId } = await params; // ✅ FIX
=======
    const { userId } = await auth();
    if (!userId) return errorResponse("Unauthorized", origin, 401);
>>>>>>> codex/create-api-for-adding-designs-to-collection-waqk9m

    const body = await req.json();
    const { name, storeUrl } = body;

    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!store) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prismadb.store.update({
      where: { id: storeId },
      data: {
        ...(name && { name }),
        ...(storeUrl && { storeUrl }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[STORE_PATCH]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}