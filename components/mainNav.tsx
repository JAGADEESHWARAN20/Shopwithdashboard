<<<<<<< HEAD
"use client";

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { X, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
    const [isOpen, setIsOpen] = useState(false);
    
    const pathname = usePathname();
    const params = useParams();

    const routes = [
        { href: `/${params.storeId}`, label: 'Overview' },
        { href: `/${params.storeId}/billboards`, label: 'Billboards' },
        { href: `/${params.storeId}/categories`, label: 'Categories' },
        { href: `/${params.storeId}/design-collections`, label: 'Collections' },
        { href: `/${params.storeId}/sizes`, label: 'Sizes' },
        { href: `/${params.storeId}/colors`, label: 'Colors' },
        { href: `/${params.storeId}/products`, label: 'Products' },
        { href: `/${params.storeId}/orders`, label: 'Orders' },
        { href: `/${params.storeId}/settings`, label: 'Settings' },

       

    ];

 
    return (
        <nav className={cn("relative w-full", className)} {...props}>
            <div className="flex items-center justify-start p-4 bg-white dark:bg-gray-900 border-b">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="sm:hidden text-gray-700 dark:text-gray-300 focus:outline-none"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <div className="hidden sm:flex space-x-6">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                pathname === route.href ? "text-black dark:text-white" : "text-muted-foreground"
                            )}
                        >
                            {route.label}
                        </Link>
                    ))}
                </div>
            </div>
            {isOpen && (
                <div
                    className={`absolute top-full z-[99999] left-0 w-[${window.innerWidth - 60}px] bg-white dark:bg-gray-900 shadow-md sm:hidden flex flex-col p-4 space-y-2`}
                >
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                pathname === route.href ? "text-black dark:text-white" : "text-muted-foreground"
                            )}
                            onClick={() => setIsOpen(false)}
                        >
                            {route.label}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
=======
"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { X, Menu } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouteLoader } from "@/hooks/use-route-loader";

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const start = useRouteLoader((state) => state.start);
  const stop = useRouteLoader((state) => state.stop);

  const storeId = params?.storeId as string;

  const routes = useMemo(
    () => [
      { href: `/${storeId}`, label: "Overview" },
      { href: `/${storeId}/billboards`, label: "Billboards" },
      { href: `/${storeId}/categories`, label: "Categories" },
      { href: `/${storeId}/sizes`, label: "Sizes" },
      { href: `/${storeId}/colors`, label: "Colors" },
      { href: `/${storeId}/products`, label: "Products" },
      { href: `/${storeId}/orders`, label: "Orders" },
      { href: `/${storeId}/settings`, label: "Settings" },
      { href: `/${storeId}/design-collections`, label: "Collections" },
    ],
    [storeId]
  );

  const handleNavigate = (href: string) => {
    start();
    startTransition(() => {
      router.push(href);
      router.prefetch(href);
      setIsOpen(false);
      setTimeout(() => stop(), 180);
    });
  };

  return (
    <nav className={cn("relative w-full", className)} {...props}>
      <div className="flex items-center justify-start p-2 bg-white dark:bg-gray-900 border-b">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="sm:hidden text-gray-700 dark:text-gray-300 focus:outline-none"
          aria-label="Toggle navigation"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="hidden sm:flex flex-wrap gap-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              prefetch
              onClick={(e) => {
                e.preventDefault();
                handleNavigate(route.href);
              }}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === route.href ? "text-black dark:text-white" : "text-muted-foreground"
              )}
            >
              {route.label}
            </Link>
          ))}
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full z-50 left-0 right-0 bg-white dark:bg-gray-900 shadow-md sm:hidden flex flex-col p-4 space-y-2 border">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              prefetch
              onClick={(e) => {
                e.preventDefault();
                handleNavigate(route.href);
              }}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === route.href ? "text-black dark:text-white" : "text-muted-foreground"
              )}
            >
              {route.label}
            </Link>
          ))}
        </div>
      )}

      {isPending && <div className="h-0.5 w-full bg-primary animate-pulse" />}
    </nav>
  );
}
>>>>>>> codex/create-api-for-adding-designs-to-collection-waqk9m
