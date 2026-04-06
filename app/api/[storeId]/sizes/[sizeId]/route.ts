import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type SizeRouteParams = { storeId: string; sizeId: string } | Promise<{ storeId: string; sizeId: string }>;

async function resolveParams(params: SizeRouteParams) {
    return await Promise.resolve(params);
}

export async function GET(
    req: Request,
    { params }: { params: SizeRouteParams }
) {
    try {
        const { storeId, sizeId } = await resolveParams(params);
        if (!sizeId) {
            return new NextResponse("Size Id id is Required", { status: 400 })
        }
        if (!storeId) {
            return new NextResponse("Store ID is required", { status: 400 })
        }

        const size = await prismadb.size.findFirst({
            where: {
                id: sizeId,
                storeId,
            }
        });

        return NextResponse.json(size);

    } catch (error) {
        console.log('[SIZE_GET]', error);
        return new NextResponse('Internal error', { status: 500 });
    }
};


export async function PATCH(
    req: Request,
    { params }: { params: SizeRouteParams }
) {
    try {
        const { storeId, sizeId } = await resolveParams(params);
        const { userId } = await auth();
        const body = await req.json();
        const { name, value } = body;

        if (!userId) {
            return new NextResponse("Unauthoricated", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 })
        }
        if (!value) {
            return new NextResponse("Value  is required", { status: 400 })
        }

        if (!sizeId) {
            return new NextResponse("Size id is Required", { status: 400 })
        }
        if (!storeId) {
            return new NextResponse("Store ID is required", { status: 400 })
        }
        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        const size = await prismadb.size.updateMany({
            where: {
                id: sizeId,
                storeId,
            },
            data: {
                name,
                value
            }
        });

        return NextResponse.json(size);

    } catch (error) {
        console.log('[SIZE_PATCH]', error);
        return new NextResponse('Internal error', { status: 500 });
    }
};



export async function DELETE(
    req: Request,
    { params }: { params: SizeRouteParams }
) {
    try {
        const { storeId, sizeId } = await resolveParams(params);
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthoricated", { status: 401 });
        }

        if (!sizeId) {
            return new NextResponse("Size Id is Required", { status: 400 })
        }
        if (!storeId) {
            return new NextResponse("Store ID is required", { status: 400 })
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 })
        }


        const size = await prismadb.size.deleteMany({
            where: {
                id: sizeId,
                storeId,
            }
        });

        return NextResponse.json(size);

    } catch (error) {
        console.log('[SIZE_DELETE]', error);
        return new NextResponse('Internal error', { status: 500 });
    }
};



