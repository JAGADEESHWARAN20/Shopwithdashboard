import prismadb from "@/lib/prismadb";
import { CategoryForm } from "./components/category-form";

const CategoryPage = async ({
    params
}: {
    params: Promise<{ categoryId: string, storeId: string }>
}) => {
  const resolvedParams = await params;
    const category = await prismadb.category.findUnique({
        where: {
            id: resolvedParams.categoryId
        }
    });
    const billboards = await prismadb.billboard.findMany({
        where: {
            storeId: resolvedParams.storeId
        }
    });
    return (
        <>
            <div className="flex-col">
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <CategoryForm billboards={billboards} initialData={category} />
                </div>
            </div>
        </>
    );
}

export default CategoryPage;