import prismadb from "@/lib/prismadb";
import { format } from "date-fns";
import { DesignCollectionForm } from "./components/collection-form";
import { DesignsClient } from "./components/designs-client";

const CollectionPage = async ({
  params,
}: {
  params: { collectionId: string; storeId: string };
}) => {
  const collection = await prismadb.designCollection.findFirst({
    where: {
      id: params.collectionId,
      storeId: params.storeId,
    },
    include: {
      designs: {
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
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  const formattedDesigns =
    collection?.designs.map((item) => ({
      id: item.id,
      categoryLabel: item.title,
      previewImage: item.imageUrl,
      variationCount: item.variations.length,
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    })) || [];

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-8 p-8 pt-6">
        <DesignCollectionForm initialData={collection} />
        {collection && <DesignsClient data={formattedDesigns} />}
      </div>
    </div>
  );
};

export default CollectionPage;
