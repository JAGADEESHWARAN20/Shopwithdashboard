"use client";

import { useBrandTheme } from "@/Providers/brand-provider";
import RouteLoadingOverlay from "@/components/route-loading-overlay";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { MainNav } from "./mainNav";
import StoreSwitcher from "./store-switcher";

type NavbarStore = {
  id: string;
  name: string;
  isActive: boolean;
  storeUrl?: string | null;
};

interface NavbarProps {
  store: NavbarStore;
  stores: NavbarStore[];
}

export const Navbar: React.FC<NavbarProps> = ({ store, stores }) => {
  const { colors } = useBrandTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-[#F29F67]/25 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <RouteLoadingOverlay />
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-20 flex-wrap items-center gap-3 px-4 py-3 md:flex-nowrap md:px-6"
        initial={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 md:flex-none">
          <div
            className="hidden h-10 w-1 rounded-full md:block"
            style={{ backgroundColor: colors.primary }}
          />
          <StoreSwitcher className="min-w-0 flex-1 md:w-[240px] md:flex-none" items={stores} />
        </div>
        <MainNav className="order-3 w-full md:order-none md:flex-1" />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {store?.storeUrl ? (
            <Button
              asChild
              className="h-9 rounded-md bg-black/70 px-3 text-black hover:bg-black/70 hover:text-black"
              size="sm"
              variant="outline"
            >
              <Link href={store.storeUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Visit Store</span>
              </Link>
            </Button>
          ) : null}
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-9 w-9",
                userButtonTrigger:
                  "rounded-md border border-[#F29F67]/40 shadow-sm hover:shadow-md transition-shadow",
              },
            }}
          />
        </div>
      </motion.div>
    </header>
  );
};

export default Navbar;
