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
      variationName: item.description || "-",
      imageUrl: item.imageUrl,
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    })) || [];

  const designGroups = Object.entries(
    (collection?.designs || []).reduce<Record<string, number>>((acc, item) => {
      const key = item.title?.trim() || "Other";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([label, count]) => ({ label, count }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-8 p-8 pt-6">
        <DesignCollectionForm initialData={collection} />
        {collection && <DesignsClient data={formattedDesigns} groups={designGroups} />}
      </div>
    </div>
  );
};

export default CollectionPage;
