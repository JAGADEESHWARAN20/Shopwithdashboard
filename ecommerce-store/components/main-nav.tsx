"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from '@/lib/utils'
import { Category } from "@/types";

interface MainNavProps {
     data: Category[],
}


const MainNav: React.FC<MainNavProps> = ({ data }) => {
     const pathname = usePathname();
     const routes = data.map((route) => ({
          href: `/category/${route.id}`,
          label: route.name,
          active: pathname === `/category/${route.id}`
     }))
     return (
          <>

               <nav className="mx-3 sm:mx-3 lg:mx-6  flex items-center space-x-[10px] sm:space-x-[10px] lg:space-x-6">
                    {routes.map((route) => (
                         <Link
                              key={route.href}
                              href={route.href}
                              className={cn("text-sm transition-colors hover:text-black font-medium", route.active ? "text-black" : "text-neutral-500")}
                         >
                              {route.label}
                         </Link>
                    ))}
               </nav>
          </>
     )
}

export default MainNav;
