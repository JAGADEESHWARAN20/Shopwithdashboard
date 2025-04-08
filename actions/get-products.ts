import prismadb from "@/lib/prismadb";
import { Product } from "@/types";

export const getProducts = async (storeId: string): Promise<Product[]> => {
    try {
        const products = await prismadb.product.findMany({
            where: {
                storeId,
                isFeatured: true,
            },
            include: {
                category: true,
                size: true,
                color: true,
                images: true,
            },
        });

        return products.map((product) => ({
            id: product.id,
            name: product.name,
            price: product.price, // Keep as number (Float)
            isFeatured: product.isFeatured,
            isArchived: product.isArchived,
            sizeId: product.size.id,
            colorId: product.color.id,
            category: {
                id: product.category.id,
                name: product.category.name,
                billboardId: product.category.billboardId,
                storeId: product.category.storeId,
            },
            size: {
                id: product.size.id,
                name: product.size.name,
                value: product.size.value,
            },
            color: {
                id: product.color.id,
                name: product.color.name,
                value: product.color.value,
            },
            images: product.images.map((image) => ({
                id: image.id,
                url: image.url,
            })),
        }));
    } catch (error) {
        console.error("[GET_PRODUCTS]", error);
        return [];
    }
};
