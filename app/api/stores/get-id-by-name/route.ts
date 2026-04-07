// app/api/stores/get-id-by-name/route.ts

import { NextRequest } from "next/server";
import prismadb from "@/lib/prismadb";

// ✅ Allowed origins
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://nwtailormadestudio.vercel.app",
  "https://nwtailormadestudioadmin.vercel.app",
];

// ✅ CORS headers
function corsHeaders(origin?: string | null) {
  return {
    "Access-Control-Allow-Origin":
      origin && ALLOWED_ORIGINS.includes(origin)
        ? origin
        : ALLOWED_ORIGINS[1], // fallback to production frontend
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// ✅ Handle preflight (VERY IMPORTANT)
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");

  return new Response(null, {
    status: 200,
    headers: corsHeaders(origin),
  });
}

// ✅ GET
export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");

  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    if (!name) {
      return new Response(
        JSON.stringify({ error: "Missing 'name' query param" }),
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
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
      },
    });

    if (!store) {
      return new Response(
        JSON.stringify({ error: `No store found with name: ${name}` }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(origin),
          },
        }
      );
    }

    return new Response(JSON.stringify({ storeId: store.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(origin),
      },
    });

  } catch (error) {
    console.error("[STORE_ID_GET]", error);

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

// ✅ POST
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");

  try {
    const body = await req.json();
    const name = body?.name;

    if (!name) {
      return new Response(
        JSON.stringify({ error: "Missing 'name' in body" }),
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
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
      },
    });

    if (!store) {
      return new Response(
        JSON.stringify({ error: `No store found with name: ${name}` }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(origin),
          },
        }
      );
    }

    return new Response(JSON.stringify({ storeId: store.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(origin),
      },
    });

  } catch (error) {
    console.error("[STORE_ID_POST]", error);

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