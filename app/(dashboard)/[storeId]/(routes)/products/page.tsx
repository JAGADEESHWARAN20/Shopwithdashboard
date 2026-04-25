import { format } from "date-fns"
import prismadb from "../../../../../lib/prismadb";
import { ProductClient } from "./components/client";
import { ProductColumn } from "./components/column";
import { formatter } from "../../../../../lib/utils";
import { canViewApiEndpoints } from "@/lib/admin-access";
import { currentUser } from "@clerk/nextjs/server";

const ProductsPage = async ({
    params
}: {
    params: Promise<{ storeId: string }>
}) => {
    const { storeId } = await params;
    const user = await currentUser();
    const showApi = canViewApiEndpoints(user?.primaryEmailAddress?.emailAddress);
    const Products = await prismadb.product.findMany({
        where: {
            storeId: storeId
        },
        include: {
            category: true,
            size: true,
            color: true,
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const formattedProducts: ProductColumn[] = Products.map((item) => ({
        id: item.id,
        name: item.name,
        isFeatured: item.isFeatured,
        isArchived: item.isArchived,
        price: formatter.format(item.price),
        category: item.category.name,
        size: item.size.name,
        color: item.color.value,
        createdAt: format(item.createdAt, "MMMM do,yyyy")
    }))
    return (
        <>
            <div className="flex-col">
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <ProductClient data={formattedProducts} showApi={showApi} />
                </div>
            </div>
        </>
    )
}
export default ProductsPage;
