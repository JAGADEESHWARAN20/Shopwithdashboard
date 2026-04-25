import { format } from "date-fns"
import prismadb from "@/lib/prismadb";
import { ColorClient } from "./components/client";
import { ColorColumn } from "./components/column";
import { canViewApiEndpoints } from "@/lib/admin-access";
import { currentUser } from "@clerk/nextjs/server";

const Colorspage = async ({
    params
}: {
    params: Promise<{ storeId: string }>
}) => {
    const { storeId } = await params;
    const user = await currentUser();
    const showApi = canViewApiEndpoints(user?.primaryEmailAddress?.emailAddress);
    const colors = await prismadb.color.findMany({
        where: {
            storeId: storeId
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const formattedSizes: ColorColumn[] = colors.map((item) => ({
        id: item.id,
        name: item.name,
        value: item.value,
        createdAt: format(item.createdAt, "MMMM do,yyyy")
    }))
    return (
        <>
            <div className="flex-col">
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <ColorClient data={formattedSizes} showApi={showApi} />
                </div>
            </div>
        </>
    )
}
export default Colorspage;
