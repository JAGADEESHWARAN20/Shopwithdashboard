import { format } from "date-fns"
import prismadb from "@/lib/prismadb";
import { BillboardClient } from "./components/client";
import { BillboardColumn } from "./components/column";
import type { Billboard } from "@prisma/client";
import { canViewApiEndpoints } from "@/lib/admin-access";
import { currentUser } from "@clerk/nextjs/server";

const BillboardsPage = async ({
    params
}:{
    params: Promise<{ storeId: string }>
}) => {
    const { storeId } = await params;
    const user = await currentUser();
    const showApi = canViewApiEndpoints(user?.primaryEmailAddress?.emailAddress);
    const billboards = await prismadb.billboard.findMany({
        where:{
            storeId: storeId
        },
        orderBy:{
            createdAt: 'desc'
        }
    });

    const formattedBillboards: BillboardColumn[] = billboards.map((item: Billboard) => ({
        id: item.id,
        label: item.label,
        createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }));
    return (
        <>
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
            <BillboardClient data={formattedBillboards} showApi={showApi}/>
            </div>
        </div>
        </>
    )
}
export default BillboardsPage;
