"use client"

import { ShoppingBag } from "lucide-react";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import useCart from "@/hooks/use-cart";
import { useRouter } from "next/navigation";

const NavBarActions = () => {
     const router = useRouter();
     const [isMounted, setIsMounted] = useState(false)
     const cart = useCart();

     useEffect(() => {
          setIsMounted(true)
     }, [])

     if (!isMounted) {
          return null
     }

     return (
          <div className="ml-auto flex items-center pr-2 gap-x-4">
               <Button onClick={() => router.push('/cart')} className="bg-black px-4 py-2 flex items-center rounded-full">
                    <ShoppingBag size={20} color="white" />
                    <span className="ml-2 text-sm font-medium text-white">{cart.items.length}</span>
               </Button>

          </div >
     )
}

export default NavBarActions;
