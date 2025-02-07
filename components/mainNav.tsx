// "use client";

// import { cn } from '@/lib/utils';
// import Link from 'next/link';
// import { useParams, usePathname } from 'next/navigation';
// import { X, Menu } from 'lucide-react'
// export function MainNav({
//     className,
//     ...props
// }: React.HTMLAttributes<HTMLElement>) {
//     const pathname = usePathname();
//     const params = useParams();
//     const routes = [
//         {
//             href: `/${params.storeId}`,
//             label: 'Overview',
//             active: pathname === `/${params.storeId}`,
//         },
//         {
//             href: `/${params.storeId}/billboards`,
//             label: 'Billboards',
//             active: pathname === `/${params.storeId}/billboards`,
//         },
//         {
//             href: `/${params.storeId}/categories`,
//             label: 'Categories',
//             active: pathname === `/${params.storeId}/categories`,
//         },
//         {
//             href: `/${params.storeId}/sizes`,
//             label: 'Sizes',
//             active: pathname === `/${params.storeId}/sizes`,
//         },
//         {
//             href: `/${params.storeId}/colors`,
//             label: 'Colors',
//             active: pathname === `/${params.storeId}/colors`,
//         },
//         {
//             href: `/${params.storeId}/products`,
//             label: 'Products',
//             active: pathname === `/${params.storeId}/products`,
//         },
//         {
//             href: `/${params.storeId}/orders`,
//             label: 'Orders',
//             active: pathname === `/${params.storeId}/orders`,
//         },
//         {
//             href: `/${params.storeId}/settings`,
//             label: 'Settings',
//             active: pathname === `/${params.storeId}/settings`,
//         }
//     ];

//     return (
//         <nav className={cn("flex sm:flex-col  items-center space-x-4 lg:space-x-6", className)}>
//             <Menu />
//             <X />
//             {routes.map((route) => (
//                 <Link
//                     key={route.href}
//                     href={route.href}
//                     className={
//                         cn("text-sm  font-medium transition-colors hover:text-primary",
//                             route.active ? "text-black dark:text-white" : " text-muted-foreground"
//                         )}
//                 >
//                     {route.label}
//                 </Link>
//             ))
//             }
//         </nav>
//     )
// };
"use client";

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { X, Menu } from 'lucide-react';
import { useState } from 'react';

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const params = useParams();

    const routes = [
        { href: `/${params.storeId}`, label: 'Overview' },
        { href: `/${params.storeId}/billboards`, label: 'Billboards' },
        { href: `/${params.storeId}/categories`, label: 'Categories' },
        { href: `/${params.storeId}/sizes`, label: 'Sizes' },
        { href: `/${params.storeId}/colors`, label: 'Colors' },
        { href: `/${params.storeId}/products`, label: 'Products' },
        { href: `/${params.storeId}/orders`, label: 'Orders' },
        { href: `/${params.storeId}/settings`, label: 'Settings' },
    ];

    return (
        <nav className={cn("relative w-full", className)} {...props}>
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border-b">
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
                <div className="absolute top-full z-[99999] left-0 w-full bg-white dark:bg-gray-900 shadow-md sm:hidden flex flex-col p-4 space-y-2">
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
