// components/navbar.tsx
"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MainNav } from "./mainNav";
import prismadb from "@/lib/prismadb";
import { useEffect, useState } from "react";

// Use default import for StoreSwitcher
import StoreSwitcher from "./store-switcher";

interface NavbarProps {
    storeUrl?: string | null; // Add storeUrl prop
}

export const Navbar: React.FC<NavbarProps> = ({ storeUrl }) => {
    const { userId } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const [stores, setStores] = useState<any[]>([]);

    useEffect(() => {
        const fetchStores = async () => {
            if (userId) {
                const storesData = await prismadb.store.findMany({
                    where: {
                        userId,
                    },
                });
                setStores(storesData);
            }
        };
        fetchStores();
    }, [userId]);

    return (
        <div className="border-b">
            <div className="flex h-16 items-center px-4">
                <StoreSwitcher items={stores} />
                <MainNav className="mx-6" />
                <div className="ml-auto flex items-center space-x-4">
                    {storeUrl && (
                        <Link href={storeUrl} target="_blank" rel="noopener noreferrer">
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