import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

type Params<T> = { params: Promise<T> };

export async function GET(req: NextRequest, { params }: Params<{ recentWorkId: string }>) {
  const { recentWorkId } = await params;
  const item = await prismadb.recentWork.findUnique({ where: { id: recentWorkId }, include: { category: true } });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: Params<{ storeId: string; recentWorkId: string }>) {
  const { userId } = await auth();
  const { storeId, recentWorkId } = await params;
  if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

  const store = await prismadb.store.findFirst({ where: { id: storeId, userId } });
  if (!store) return new NextResponse("Unauthorized", { status: 403 });

  const { title, imageUrl, categoryId } = await req.json();
  if (!title || !imageUrl || !categoryId) return new NextResponse("Missing fields", { status: 400 });

  const updated = await prismadb.recentWork.update({ where: { id: recentWorkId }, data: { title, imageUrl, categoryId } });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Params<{ storeId: string; recentWorkId: string }>) {
  const { userId } = await auth();
  const { storeId, recentWorkId } = await params;
  if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
  const store = await prismadb.store.findFirst({ where: { id: storeId, userId } });
  if (!store) return new NextResponse("Unauthorized", { status: 403 });

  await prismadb.recentWork.delete({ where: { id: recentWorkId } });
  return NextResponse.json({ success: true });
}
