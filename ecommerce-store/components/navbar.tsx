// import Link from 'next/link'
// import Container from "@/components/ui/container";
// import MainNav from "@/components/main-nav"
// import NavBarActions from "@/components/navbar-actions"

// import getCategories from '@/actions/get-categories';



// const Navbar = async () => {
//      const categories = await getCategories();
//      return (
//           <>
//                <div className="border-b">
//                     <Container>
//                          <div className='relative px-4 sm:px-6 lg:px-8 flex h-16 items-center'>
//                               <Link href={'/'} className="ml-4 lg:mx-0 flex gap-x-2">
//                                    <p className='text-3xl font-bold'>Store</p>
//                               </Link>
//                               <MainNav data={categories} />
//                               <NavBarActions />
//                          </div>

//                     </Container>

//                </div>
//           </>
//      )
// }

// export default Navbar;

"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Container from "@/components/ui/container";
import MainNav from "@/components/main-nav";
import NavBarActions from "@/components/navbar-actions";
import getCategories from '@/actions/get-categories';
import { Category } from "@/types";

const Navbar = () => {
     const [categories, setCategories] = useState<Category[]>([]);

     useEffect(() => {
          // Immediately-invoked async function within useEffect
          (async () => {
               try {
                    const cats = await getCategories();
                    setCategories(cats);
               } catch (error) {
                    console.error("Failed to fetch categories:", error);
               }
          })();
     }, []);

     return (
          <div className="border-b">
               <Container>
                    <div className="relative px-4 sm:px-6 lg:px-8 flex h-16 items-center">
                         <Link href={'/'} className="ml-4 lg:mx-0 flex gap-x-2">
                              <p className="text-3xl font-bold">Store</p>
                         </Link>
                         <MainNav data={categories} />
                         <NavBarActions />
                    </div>
               </Container>
          </div>
     );
};

export default Navbar;
