import prismadb from "@/lib/prismadb";
import { ProductForm } from "./components/product-form";

const ProductsPage = async ({
    params
}: {
    params: Promise<{ productId: string, storeId: string }>
}) => {
  const resolvedParams = await params;
    const products = await prismadb.product.findUnique({
        where: {
            id: resolvedParams.productId
        },
        include: {
            images: true
        }
    });
    const colors = await prismadb.color.findMany({
        where: {
            storeId: resolvedParams.storeId
        }
    });
    const categories = await prismadb.category.findMany({
        where: {
            storeId: resolvedParams.storeId
        }
    });
    const sizes = await prismadb.size.findMany({
        where: {
            storeId: resolvedParams.storeId
        }
    });
    return (
        <>
            <div className="flex-col">
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <ProductForm categories={categories} sizes={sizes} colors={colors} initialData={products} />
                </div>
            </div>
        </>
    );
}

export default ProductsPage;