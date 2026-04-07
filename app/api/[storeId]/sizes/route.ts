import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { getCorsHeaders } from "@/lib/api-utils";

type Params = { params: Promise<{ storeId: string }> };

// ================= OPTIONS =================
export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");

  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

// ================= POST =================
export async function POST(req: NextRequest, { params }: Params) {
  const origin = req.headers.get("origin");

  try {
    const { storeId } = await params;
    const { userId } = await auth();

    const body = await req.json();
    const { name, value } = body;

    if (!userId)
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: getCorsHeaders(origin),
      });

    if (!name)
      return new NextResponse("Name is required", {
        status: 400,
        headers: getCorsHeaders(origin),
      });

    if (!value)
      return new NextResponse("Value is required", {
        status: 400,
        headers: getCorsHeaders(origin),
      });

    if (!storeId)
      return new NextResponse("Store ID is required", {
        status: 400,
        headers: getCorsHeaders(origin),
      });

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId)
      return new NextResponse("Unauthorized", {
        status: 403,
        headers: getCorsHeaders(origin),
      });

    const created = await prismadb.size.create({
      data: { name, value, storeId },
    });

    return NextResponse.json(created, {
      headers: getCorsHeaders(origin),
    });
  } catch (error) {
    console.error("[SIZES_POST]", error);
    return new NextResponse("Internal error", {
      status: 500,
      headers: getCorsHeaders(origin),
    });
  }
}

// ================= GET =================
export async function GET(req: NextRequest, { params }: Params) {
  const origin = req.headers.get("origin");

  try {
    const { storeId } = await params;

    if (!storeId)
      return new NextResponse("Store ID is required", {
        status: 400,
        headers: getCorsHeaders(origin),
      });

    const sizes = await prismadb.size.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sizes, {
      headers: getCorsHeaders(origin),
    });
  } catch (error) {
    console.error("[SIZES_GET]", error);
    return new NextResponse("Internal error", {
      status: 500,
      headers: getCorsHeaders(origin),
    });
  }
}