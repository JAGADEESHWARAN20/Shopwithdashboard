import prismadb from "../../../../../lib/prismadb";
import { auth } from '@clerk/nextjs/server';
import { redirect } from "next/navigation";
import SettingsForm from "./components/SettingsForm";

interface SettingsPageProps {
    params: {
        storeId: string;
    };
}

const SettingsPage: React.FC<SettingsPageProps> = async ({ params }) => {
    const { userId } = auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const store = await prismadb.store.findFirst({
        where: {
            id: params.storeId,
            userId,
        },
    });

    if (!store) {
        redirect("/");
    }

    // Ensure storeUrl is a string (or StoreUrl) by providing a fallback if null
    const initialData = {
        ...store,
        storeUrl: store.storeUrl || "", // Fallback to empty string if null
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