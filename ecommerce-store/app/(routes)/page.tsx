import Container from "@/components/ui/container";
import Billboard from "@/components/billboard";
import getBillboards from '@/actions/get-billboards'
import getProducts from "@/actions/get-products";
import ProductList from "@/components/product-list";
const HomePage = async () => {
     const products = await getProducts({ isFeatured: true })
     const billboard = await getBillboards("1031bfd3-bdb5-4f7d-8363-569eba3fb455");

     return (
          <>
               <Container>
                    <div className="space-y-10 pb-10">
                         <Billboard data={billboard} />
                    </div>
                    <div className="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
                         <ProductList title={"Featured Products"} items={products} />
                    </div>
               </Container>
          </>
     );
};

export default HomePage;