import prismadb from "../../../../../lib/prismadb";
import { auth } from '@clerk/nextjs/server';
import { redirect } from "next/navigation";
import SettingsForm from "./components/SettingsForm";

interface SettingsPageProps {
  params: Promise<{
    storeId: string;
  }>;
}

const SettingsPage: React.FC<SettingsPageProps> = async ({ params }) => {
  const { storeId } = await params; // ✅ IMPORTANT

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: storeId, // ✅ use extracted value
      userId,
    },
  });

  if (!store) {
    redirect("/");
  }

  const initialData = {
    name: store.name,
    isActive: store.isActive,
    storeUrl: store.storeUrl || "",
    alternateUrls: store.alternateUrls || [],
    logoUrl: store.logoUrl || null,
    razorpayWebhookId: store.razorpayWebhookId || null,
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SettingsForm initialData={initialData} />
      </div>
    </div>
  );
};

export default SettingsPage;