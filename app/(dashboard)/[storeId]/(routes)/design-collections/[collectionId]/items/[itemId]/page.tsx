import { redirect } from "next/navigation";

const ItemRedirectPage = async ({ params }: { params: Promise<{ storeId: string; collectionId: string; itemId: string }> }) => {
  const { storeId, collectionId, itemId } = await params;
  redirect(`/${storeId}/design-collections/${collectionId}/designs/${itemId}`);
};

export default ItemRedirectPage;
