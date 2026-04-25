"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Image,
  LayoutDashboard,
  Menu,
  Package,
  Palette,
  Ruler,
  Settings,
  ShoppingBag,
  Sparkles,
  Tags,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const params = useParams();

  const routes = [
    { href: `/${params.storeId}`, label: "Overview", icon: LayoutDashboard },
    { href: `/${params.storeId}/billboards`, label: "Billboards", icon: Image },
    { href: `/${params.storeId}/categories`, label: "Categories", icon: Tags },
    { href: `/${params.storeId}/products`, label: "Products", icon: Package },
    { href: `/${params.storeId}/recentworks`, label: "Recent Works", icon: Sparkles },
    { href: `/${params.storeId}/Measurements`, label: "Measurements", icon: Ruler },
    { href: `/${params.storeId}/design-collections`, label: "Collections", icon: Palette },
    { href: `/${params.storeId}/orders`, label: "Orders", icon: ShoppingBag },
    { href: `/${params.storeId}/bookings`, label: "Bookings", icon: CalendarCheck },
    { href: `/${params.storeId}/settings`, label: "Settings", icon: Settings },
  ];

  return (
    <nav className={cn("min-w-0", className)} {...props}>
      <div className="flex items-center justify-end md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              aria-label="Open navigation"
              className="h-10 w-10 bg-black/70 text-black hover:bg-black/70 hover:text-black"
              size="icon"
              variant="outline"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>Manage the active store workspace.</SheetDescription>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-1">
              {routes.map((route) => {
                const Icon = route.icon;
                const isActive = pathname === route.href;

                return (
                  <SheetClose asChild key={route.href}>
                    <Link
                      href={route.href}
                      className={cn(
                        "flex min-w-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-black/10 text-black"
                          : "text-black hover:bg-black/10 hover:text-black",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{route.label}</span>
                    </Link>
                  </SheetClose>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden min-w-0 items-center gap-1 overflow-x-auto rounded-md bg-muted/55 p-1 md:flex">
        {routes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname === route.href;

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "relative flex h-10 min-w-max items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
                isActive
                  ? "text-black"
                  : "text-black hover:bg-black/10 hover:text-black",
              )}
            >
              {isActive ? (
                <motion.span
                  className="absolute inset-0 rounded-md bg-black/10 shadow-sm"
                  layoutId="main-nav-active"
                  transition={{ duration: 0.22, ease: "easeOut" }}
                />
              ) : null}
              <Icon className="relative h-4 w-4 shrink-0" />
              <span className="relative truncate">{route.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
