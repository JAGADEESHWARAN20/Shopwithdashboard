import prismadb from "@/lib/prismadb";
import { SizeForm } from "./components/size-form";

const CategoryPage = async ({
    params
}: {
    params: Promise<{ sizeId: string }>
}) => {
    const resolvedParams = await params;
    const size = await prismadb.size.findUnique({
        where: {
            id: resolvedParams.sizeId
        }
    });
    return (
        <>
            <div className="flex-col">
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <SizeForm initialData={size} />
                </div>
            </div>
        </>
    );
}

export default CategoryPage;