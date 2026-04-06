import prismadb from "@/lib/prismadb";
import { DesignForm } from "../../components/design-form";

const DesignItemPage = async ({
  params,
}: {
  params: Promise<{ storeId: string; collectionId: string; designId: string }>;
}) => {
  const resolvedParams = await params;
  const design =
    resolvedParams.designId === "new"
      ? null
      : await prismadb.designItem.findFirst({
          where: {
            id: resolvedParams.designId,
            collectionId: resolvedParams.collectionId,
            collection: { storeId: resolvedParams.storeId },
}) => {
  const resolvedParams = await params;
  const design =
    resolvedParams.designId === "new"
      ? null
      : await prismadb.designItem.findFirst({
          where: {

            id: resolvedParams.designId,
            collectionId: resolvedParams.collectionId,
            collection: { storeId: resolvedParams.storeId },

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

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <DesignForm initialData={design} />
      </div>
    </div>
  );
};

export default DesignItemPage;
