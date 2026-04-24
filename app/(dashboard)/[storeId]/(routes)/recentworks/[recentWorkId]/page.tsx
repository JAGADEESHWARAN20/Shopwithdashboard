import prismadb from "@/lib/prismadb";
import { RecentWorkForm } from "./components/recent-work-form";

const RecentWorkPage = async ({ params }: { params: Promise<{ storeId: string; recentWorkId: string }> }) => {
  const { storeId, recentWorkId } = await params;

  const recentWork = recentWorkId === "new" ? null : await prismadb.recentWork.findUnique({ where: { id: recentWorkId } });
  const categories = await prismadb.category.findMany({ where: { storeId }, orderBy: { name: "asc" } });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <RecentWorkForm initialData={recentWork} categories={categories} />
      </div>
    </div>
  );
};

export default RecentWorkPage;
