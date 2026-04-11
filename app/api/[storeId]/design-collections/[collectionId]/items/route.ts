import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

type Params<T> = { params: Promise<T> };
export async function GET(req: NextRequest, { params }: Params<{ storeId: string; collectionId: string }>) { const { storeId, collectionId } = await params; const items = await prismadb.designItem.findMany({ where: { collectionId, collection: { storeId } }, include: { variations: true }, orderBy: { createdAt: "desc" } }); return NextResponse.json(items); }
export async function POST(req: NextRequest, { params }: Params<{ storeId: string; collectionId: string }>) { const { userId } = await auth(); const { storeId, collectionId } = await params; if (!userId) return new NextResponse("Unauthenticated", { status: 401 }); const store = await prismadb.store.findFirst({ where: { id: storeId, userId } }); if (!store) return new NextResponse("Unauthorized", { status: 403 }); const { title, imageUrl, description, tags } = await req.json(); const item = await prismadb.designItem.create({ data: { title, imageUrl, description, tags: Array.isArray(tags) ? tags : [], collectionId } }); return NextResponse.json(item); }
