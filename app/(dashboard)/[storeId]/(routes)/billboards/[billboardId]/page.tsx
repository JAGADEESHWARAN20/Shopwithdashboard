import prismadb from "@/lib/prismadb";
import { BillboardForm } from "./components/billboard-form";
import { BillboardDTO } from "@/types";

const BillboardsPage = async ({
    params
}:{
    params: { billboardId: string}
}) => {
    const billboard = await prismadb.billboard.findUnique({
        where: {
            id: params.billboardId
        }
    });
    const safeBillboard: BillboardDTO | null = billboard
  ? {
      id: billboard.id,
      label: billboard.label,
      imageUrl: billboard.imageUrl,
      isFeatured: billboard.isFeatured ?? false, // ✅ normalize
    }
  : null;
    return ( 
        <>
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
            <BillboardForm initialData={safeBillboard} /> 
            </div>
        </div>
        </>
     );
}
 
export default BillboardsPage;