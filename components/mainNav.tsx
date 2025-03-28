"use client";

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { X, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
    const [isOpen, setIsOpen] = useState(false);
    const [menuWidth, setMenuWidth] = useState(0); // Add menu width state
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
        { href: `/${params.storeId}/storefront`, label: 'StoreFront' },

    ];

    useEffect(() => {
        const handleResize = () => {
            if (isOpen) {
                setMenuWidth(window.innerWidth); // Update width on resize when open
            }
        };

        handleResize(); // Initial width set
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen]);

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
                    className={`absolute top-full z-[99999] left-0 w-[${menuWidth}px] bg-white dark:bg-gray-900 shadow-md sm:hidden flex flex-col p-4 space-y-2`}
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