import { getFeaturedBillboard } from '../../../../../actions/get-featured-billboards';
import { getStoreName } from '../../../../../actions/get-storename';
import { getProducts } from '../../../../../actions/get-products';
import { getStoreId } from '../../../../../utils/storeId';
import { Billboard, Product, Store } from '@/types';
import StoreFront from '../../../../../components/StoreFront';

export default async function HomePage() {
     // Extract store ID from subdomain
     const storeId = await getStoreId();

     if (!storeId) {
          return <div>Error: Store ID not found.</div>;
     }

     try {
          // Fetch store information
          const storeData = await getStoreName(storeId);
          if (!storeData) {
               return <div>Store information not found.</div>;
          }

          // Fetch featured billboard
          const billboard = await getFeaturedBillboard(storeId);

          // Fetch products
          const products = await getProducts(storeId);

          return (
               <StoreFront
                    initialStore={params.storeId} // Corrected prop name
                    initialBillboard={billboard}
                    initialProducts={products}
               />
          );
     } catch (error) {
          console.error("Error fetching data:", error);
          return <div>Error loading store. Please try again later.</div>;
     }
}