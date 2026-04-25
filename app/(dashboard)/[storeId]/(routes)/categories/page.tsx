import { format } from "date-fns"
import prismadb from "@/lib/prismadb";
import { CategoryClient } from "./components/client";
import { CategoryColumn } from "./components/column";
import { canViewApiEndpoints } from "@/lib/admin-access";
import { currentUser } from "@clerk/nextjs/server";

const CategoriesPage = async ({
    params
}: {
    params: Promise<{ storeId: string }>
}) => {
    const { storeId } = await params;
    const user = await currentUser();
    const showApi = canViewApiEndpoints(user?.primaryEmailAddress?.emailAddress);
    const categories = await prismadb.category.findMany({
        where: {
            storeId: storeId
        },
        include: {
            billboard: true,
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const formattedCategories: CategoryColumn[] = categories.map((item) => ({
        id: item.id,
        name: item.name,
        billboardLabel: item.billboard.label,
        createdAt: format(item.createdAt, "MMMM do,yyyy")
    }))
    return (
        <>
            <div className="flex-col">
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <CategoryClient data={formattedCategories} showApi={showApi} />
                </div>
            </div>
        </>
    )
}
export default CategoriesPage;
