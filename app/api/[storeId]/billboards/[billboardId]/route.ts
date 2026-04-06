import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: { billboardId: string } }
) {
    try {
        if (!params.billboardId) {
            return new NextResponse("billboardId id is Required", { status: 400 })
        }

        const billboard = await prismadb.billboard.findUnique({
            where: {
                id: params.billboardId,
            }
        });

        return NextResponse.json(billboard);

    } catch (error) {
        console.log('[BILLBOARD_GET]', error);
        return new NextResponse('Internal error', { status: 500 });
    }
};

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, billboardId: string } }
) {
  try {
    const { userId } =await auth();
    const body = await req.json();

    // 1. Ensure imageUrl is extracted from the body
    const { label, imageUrl } = body;

    if (!userId) return new NextResponse("Unauthenticated", { status: 403 });
    if (!label) return new NextResponse("Label is required", { status: 400 });
    
    // 2. Validate imageUrl
    if (!imageUrl) return new NextResponse("Image URL is required", { status: 400 });

    if (!params.billboardId) return new NextResponse("Billboard id is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId }
    });

    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 405 });

    // 3. Ensure imageUrl is passed to the database update
    const billboard = await prismadb.billboard.update({
      where: {
        id: params.billboardId,
      },
      data: {
        label,
        imageUrl // <--- THIS WAS LIKELY MISSING
      }
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log('[BILLBOARD_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}



export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, billboardId: string } }
) {
    try {
        const { userId } =await auth();

        if (!userId) {
            return new NextResponse("Unauthoricated", { status: 401 });
        }

        if (!params.billboardId) {
            return new NextResponse("BillboardId id is Required", { status: 400 })
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 })
        }


        const billboard = await prismadb.billboard.deleteMany({
            where: {
                id: params.billboardId,
            }
        });

        return NextResponse.json(billboard);

    } catch (error) {
        console.log('[BILLBOARD_DELETE]', error);
        return new NextResponse('Internal error', { status: 500 });
    }
};



