import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ storeId: string; billboardId: string }> }
) {
    const { storeId, billboardId } = await params;
    try {
        if (!billboardId) {
            return new NextResponse("billboardId id is Required", { status: 400 })
        }

        const billboard = await prismadb.billboard.findUnique({
            where: {
                id: billboardId,
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
  { params }: { params: Promise<{ storeId: string; billboardId: string }> }
) {
  try {
<<<<<<< HEAD
<<<<<<< HEAD
    const { userId } =await auth();
=======
=======
>>>>>>> 95f3d2a (new update)
    const { storeId, billboardId } = await params;
    const { userId } = await auth();
>>>>>>> 95f3d2a (new update)
    const body = await req.json();


   
    const { label, imageUrl } = body;

    if (!userId) return new NextResponse("Unauthenticated", { status: 403 });
    if (!label) return new NextResponse("Label is required", { status: 400 });
    if (!imageUrl) return new NextResponse("Image URL is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 405 });

    const billboard = await prismadb.billboard.update({
      where: { id: billboardId },
      data: { label, imageUrl },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}


export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ storeId: string; billboardId: string }> }
) {
    try {
<<<<<<< HEAD
<<<<<<< HEAD
        const { userId } =await auth();
=======
=======
>>>>>>> 95f3d2a (new update)
        const { storeId, billboardId } = await params;
        const { userId } = await auth();
>>>>>>> 95f3d2a (new update)

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const billboard = await prismadb.billboard.deleteMany({
      where: { id: billboardId },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

