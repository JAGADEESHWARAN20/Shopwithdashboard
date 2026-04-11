import { redirect } from "next/navigation";

const CollectionItemsRedirect = async ({ params }: { params: Promise<{ storeId: string; collectionId: string }> }) => {
  const { storeId, collectionId } = await params;
  redirect(`/${storeId}/design-collections/${collectionId}`);
};

export default CollectionItemsRedirect;
