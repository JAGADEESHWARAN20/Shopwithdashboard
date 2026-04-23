import { format } from "date-fns";
import { RecentWorkClient } from "./components/client";
import { RecentWorkColumn } from "./components/column";
import { getRecentWorks } from "@/lib/cache/recentworks";

const RecentWorksPage = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  const { storeId } = await params;
  const recentWorks = await getRecentWorks(storeId);

  const data: RecentWorkColumn[] = recentWorks.map((item) => ({
    id: item.id,
    title: item.title,
    imageUrl: item.imageUrl,
    categoryName: item.category.name,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <RecentWorkClient data={data} />
      </div>
    </div>
  );
};

export default RecentWorksPage;
