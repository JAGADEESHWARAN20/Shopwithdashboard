"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MainNav } from "./mainNav";
import StoreSwitcher from "./store-switcher";

interface NavbarProps {
    store: any; // The current store
    stores: any[]; // List of all stores for the user
}

export const Navbar: React.FC<NavbarProps> = ({ store, stores }) => {
    const { userId } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    return (
        <div className="border-b">
            <div className="flex h-16 items-center px-4">
                <StoreSwitcher items={stores} />
                <MainNav className="mx-6" />
                <div className="ml-auto flex items-center space-x-4">
                    {store?.storeUrl && (
                        <Link href={store.storeUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline">Visit Store</Button>
                        </Link>
                    )}
                    <UserButton
                        appearance={{
                            elements: {
                                userButtonAvatarBox: "h-8 w-8", // Customize avatar size
                                userButtonTrigger: "border border-gray-300 rounded-full", // Add a border to the button
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Navbar;