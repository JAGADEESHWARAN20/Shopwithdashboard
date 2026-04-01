import prismadb from "@/lib/prismadb";
import { DesignCollectionForm } from "./components/collection-form";

const CollectionPage = async ({
  params
}: {
  params: { collectionId: string; storeId: string }
}) => {

  const collection = await prismadb.designCollection.findUnique({
    where: { id: params.collectionId }
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <DesignCollectionForm initialData={collection} />
      </div>
    </div>
  );
};

export default CollectionPage;