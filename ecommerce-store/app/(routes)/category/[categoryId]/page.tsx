import getCategory from "@/actions/get-category";
import getColors from "@/actions/get-colors";
import getProducts from "@/actions/get-products";
import getSizes from "@/actions/get-sizes";
import Billboard from "@/components/billboard";
import Container from "@/components/ui/container";
import Filter from "@/app/(routes)/category/components/filter";
import NoResults from "@/components/ui/no-results";
import ProductCard from "@/components/ui/product-card";
import { Product } from "@/types";
import MobileFilters from "../components/mobile-filter";
export const revalidate = 0;

interface CategoryPageProps {
     params: {
          categoryId: string;
     };
     searchParams: {
          colorId: string;
          sizeId: string;
     };
     product: Product;
}

const CategoryPage = async ({ params, searchParams }: CategoryPageProps) => {
     let products, sizes, colors, category;
     const concurrencyparams = await params;
     const concurrencysearchParams = await searchParams;
     try {
          // Use Promise.all to fetch all data concurrently
          [products, sizes, colors, category] = await Promise.all([
               getProducts({
                    categoryId: concurrencyparams.categoryId,
                    colorId: concurrencysearchParams.colorId,
                    sizeId: concurrencysearchParams.sizeId,
               }),
               getSizes(),
               getColors(),
               getCategory(concurrencyparams.categoryId),
          ]);
     } catch (err: unknown) {
          console.error("Failed to fetch data:", err);
          return (
               <div className="bg-white">
                    <Container>
                         <p className="text-red-500 text-center">
                              Something went wrong while loading the page.
                         </p>
                    </Container>
               </div>
          );
     }

     return (
          <div className="bg-white">
               <Container>
                    <Billboard data={category.billboard} />
                    <div className="px-4 sm:px-6 lg:px-8 pb-24">
                         <div className="lg:grid lg:grid-cols-5 lg:gap-x-5">
                              <MobileFilters sizes={sizes} colors={colors} />
                              <div className="hidden lg:block">
                                   <Filter data={sizes} valueKey="sizeId" name="Sizes" />
                                   <Filter data={colors} valueKey="colorId" name="Colors" />
                              </div>
                              <div className="mt-6 lg:col-span-4 lg:mt-0">
                                   {products.length === 0 && <NoResults />}
                                   <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {products.map((product) => (
                                             <ProductCard key={product.id} data={product} />
                                        ))}
                                   </div>
                              </div>
                         </div>
                    </div>
               </Container>
          </div>
     );
};

export default CategoryPage;