"use client"

import Container from "@/components/ui/container";
import { useEffect, useState } from "react";
import useCart from "@/hooks/use-cart";
import CartItems from "./components/cart-items";

const CartPage = () => {
     const cart = useCart();

     return (
          <div className="bg-white">
               <Container>
                    <div className="px-4  py-16 sm:px-6 lg:px-8">
                         <h1 className="text-3xl font-bold text-black">Shopping Cart</h1>
                         <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start gap-x-12">

                         </div>
                    </div>
               </Container>
          </div>
     );
}

export default CartPage;