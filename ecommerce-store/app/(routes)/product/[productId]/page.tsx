import getProduct from "@/actions/get-product";
import getProducts from "@/actions/get-products";
import Container from "@/components/ui/container";
import ProductList from "@/components/product-list"
import Gallery from "@/components/gallery"
import Info from "@/components/info";
import { MobileGallery } from "@/components/gallery/mobile-gallery"

interface ProductPageProps {
     params: {
          productId: string;
     }
}

const ProductPage: React.FC<ProductPageProps> = async ({
     params
}) => {
     const concurrencyParams = await params;
     const product = await getProduct(concurrencyParams.productId);
     const suggestedProducts = await getProducts({
          categoryId: product?.category?.id
     });

     return (
          <div className="bg-white">
               <Container>
                    <div className="px-4 py-10 sm:px-6 lg:px-8">
                         <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
                              {/* Mobile view */}
                              <MobileGallery images={product.images.map((img) => img.url)} />
                              {/* Large device view */}
                              <div className="hidden lg:block">
                                   <Gallery images={product.images} />
                              </div>

                              <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
                                   {/* info */}
                                   <Info data={product} />
                              </div>
                         </div>
                         <br className="my-10" />
                         <ProductList title="Related Products" items={suggestedProducts} />
                    </div>
               </Container>
          </div>
     )
}

export default ProductPage;
