import prismadb from "@/lib/prismadb";
import { DesignForm } from "../../components/design-form";

const DesignItemPage = async ({
  params,
}: {
  params: Promise<{
    storeId: string;
    collectionId: string;
    designId: string;
  }>;
}) => {
  const { storeId, collectionId, designId } = await params;

  let design = null;

  if (designId !== "new") {
    design = await prismadb.designItem.findFirst({
      where: {
        id: designId,
        collectionId,
        collection: {
          storeId,
        },
      },
      include: {
        variations: {
          where: {
            isActive: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <DesignForm initialData={design} />
      </div>
    </div>
  );
};

export default DesignItemPage;