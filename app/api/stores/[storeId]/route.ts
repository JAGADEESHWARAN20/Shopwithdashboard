import { NextRequest } from "next/server";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

// ✅ Allowed origins (frontend + localhost)
const ALLOWED = process.env.NEXT_PUBLIC_ALLOWED_ORIGIN?.split(",") || [];

function corsHeaders(origin?: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
  };

  if (origin && ALLOWED.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "GET, PATCH, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
  }

  return headers;
}

// ✅ OPTIONS (VERY IMPORTANT for CORS)
export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");

  return new Response(null, {
    status: 200,
    headers: corsHeaders(origin),
  });
}

// =====================================================
// 📥 GET STORE (PUBLIC - frontend can access)
// =====================================================
export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  const origin = req.headers.get("origin");

  try {
    if (!params.storeId) {
      return new Response(
        JSON.stringify({ error: "Store ID is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(origin),
          },
        }
      );
    }

    const store = await prismadb.store.findFirst({
      where: { id: params.storeId },
    });

    if (!store) {
      return new Response(
        JSON.stringify({ error: "Store not found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(origin),
          },
        }
      );
    }

    return new Response(JSON.stringify(store), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(origin),
      },
    });

  } catch (error) {
    console.error("[STORE_GET]", error);

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      }
    );
  }
}

// =====================================================
// ✏️ PATCH STORE (PROTECTED)
// =====================================================
export async function PATCH(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  const origin = req.headers.get("origin");

  try {
    const { userId } =await auth();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthenticated" }),
        {
          status: 401,
          headers: corsHeaders(origin),
        }
      );
    }

    if (!params.storeId) {
      return new Response(
        JSON.stringify({ error: "Store ID is required" }),
        {
          status: 400,
          headers: corsHeaders(origin),
        }
      );
    }

    const body = await req.json();
    const { name, storeUrl, isActive, alternateUrls, logoUrl } = body;

    // 🔎 Ownership check
    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!store) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 403,
          headers: corsHeaders(origin),
        }
      );
    }

    // 🧠 Update only provided fields
    const updatedStore = await prismadb.store.update({
      where: { id: params.storeId },
      data: {
        ...(name !== undefined && { name }),
        ...(storeUrl !== undefined && { storeUrl }),
        ...(isActive !== undefined && { isActive }),
        ...(alternateUrls !== undefined && { alternateUrls }),
        ...(logoUrl !== undefined && { logoUrl }),
      },
    });

    return new Response(JSON.stringify(updatedStore), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(origin),
      },
    });

  } catch (error) {
    console.error("[STORE_PATCH]", error);

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: corsHeaders(origin),
      }
    );
  }
}
