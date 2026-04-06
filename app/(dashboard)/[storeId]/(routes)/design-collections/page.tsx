import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { DesignCollectionClient } from "./components/client";
import { DesignCollectionColumn } from "./components/column";

const DesignCollectionsPage = async ({
  params
}: {
  params: Promise<{ storeId: string }>
}) => {
    const { storeId } = await params;

  const collections = await prismadb.designCollection.findMany({
    where: {
      storeId: storeId
    },
    orderBy: {
      createdAt: "desc"
    }
  });

 const formatted: DesignCollectionColumn[] = collections.map((item: { id: any; label: any; slug: any; isFeatured: any; createdAt: string | number | Date; }) => ({
  id: item.id,
  label: item.label,
  slug: item.slug,
  isFeatured: item.isFeatured,
  createdAt: format(
    item.createdAt instanceof Date
      ? item.createdAt
      : new Date(item.createdAt),
    "MMMM do, yyyy"
  ),
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