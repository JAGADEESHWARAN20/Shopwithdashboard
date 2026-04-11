import { redirect } from "next/navigation";

const ItemNewRedirectPage = async ({ params }: { params: Promise<{ storeId: string; collectionId: string }> }) => {
  const { storeId, collectionId } = await params;
  redirect(`/${storeId}/design-collections/${collectionId}/designs/new`);
};

export default ItemNewRedirectPage;
