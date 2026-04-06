import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

// =========================
// 🌐 CORS CONFIG
// =========================
const ALLOWED =
  process.env.NEXT_PUBLIC_ALLOWED_ORIGIN?.split(",").map(o => o.trim()) || [];

function corsHeaders(origin?: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
  };

  if (origin && ALLOWED.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "GET, PATCH, OPTIONS";
    headers["Access-Control-Allow-Headers"] =
      "Content-Type, Authorization";
  }

  return headers;
}

function json(data: unknown, status = 200, origin?: string | null) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
}

// =========================
// ✅ OPTIONS (CORS PREFLIGHT)
// =========================
export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

// =========================
// 📥 GET STORE (PUBLIC)
// =========================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const origin = req.headers.get("origin");

  try {
    const { storeId } = await params; // ✅ FIX

    if (!storeId) {
      return json({ error: "Store ID is required" }, 400, origin);
    }

    const store = await prismadb.store.findFirst({
      where: { id: storeId },
    });

    if (!store) {
      return json({ error: "Store not found" }, 404, origin);
    }

    return json(store, 200, origin);
  } catch (error) {
    console.error("[STORE_GET]", error);
    return json({ error: "Internal server error" }, 500, origin);
  }
}

// =========================
// ✏️ PATCH STORE (PROTECTED)
// =========================
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const origin = req.headers.get("origin");

  try {
    const { userId } = await auth(); // ✅ FIX


    if (!userId) {
      return json({ error: "Unauthenticated" }, 401, origin);
    }

    const { storeId } = await params; // ✅ FIX

    if (!storeId) {
      return json({ error: "Store ID is required" }, 400, origin);
    }

    const body = await req.json();

    const { name, storeUrl, isActive, alternateUrls, logoUrl } = body;

    // 🔎 Ownership check
    const store = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });

    if (!store) {
      return json({ error: "Unauthorized" }, 403, origin);
    }

    // 🧠 Safe update (no mass assignment)
    const updatedStore = await prismadb.store.update({
      where: { id: storeId },
      data: {
        ...(name !== undefined && { name }),
        ...(storeUrl !== undefined && { storeUrl }),
        ...(isActive !== undefined && { isActive }),
        ...(alternateUrls !== undefined && { alternateUrls }),
        ...(logoUrl !== undefined && { logoUrl }),
      },
    });

    return json(updatedStore, 200, origin);
  } catch (error) {
    console.error("[STORE_PATCH]", error);
    return json({ error: "Internal server error" }, 500, origin);
  }
}