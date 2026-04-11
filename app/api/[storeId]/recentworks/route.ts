import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

type Params<T> = { params: Promise<T> };

export async function GET(req: NextRequest, { params }: Params<{ storeId: string }>) {
  const { storeId } = await params;
  const records = await prismadb.recentWork.findMany({
    where: { category: { storeId } },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(records);
}

export async function POST(req: NextRequest, { params }: Params<{ storeId: string }>) {
  const { userId } = await auth();
  const { storeId } = await params;
  if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

  const store = await prismadb.store.findFirst({ where: { id: storeId, userId } });
  if (!store) return new NextResponse("Unauthorized", { status: 403 });

  const { title, imageUrl, categoryId } = await req.json();
  if (!title || !imageUrl || !categoryId) return new NextResponse("Missing fields", { status: 400 });

  const category = await prismadb.category.findFirst({ where: { id: categoryId, storeId } });
  if (!category) return new NextResponse("Invalid category", { status: 400 });

  const recentWork = await prismadb.recentWork.create({ data: { title, imageUrl, categoryId } });
  return NextResponse.json(recentWork);
}
