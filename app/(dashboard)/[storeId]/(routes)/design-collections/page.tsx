import { format } from "date-fns";
import { DesignCollectionClient } from "./components/client";
import { DesignCollectionColumn } from "./components/column";
import { getDesignCollections } from "@/lib/cache/design-collections";

const DesignCollectionsPage = async ({
  params
}: {
  params: Promise<{ storeId: string }>
}) => {
  const { storeId } = await params;

  const collections = await getDesignCollections(storeId);

  const formatted: DesignCollectionColumn[] = collections.map((item) => ({
    id: item.id,
    label: item.label,
    slug: item.slug,
    isFeatured: item.isFeatured,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <DesignCollectionClient data={formatted} />
      </div>
    </div>
  );
};

export default DesignCollectionsPage;
