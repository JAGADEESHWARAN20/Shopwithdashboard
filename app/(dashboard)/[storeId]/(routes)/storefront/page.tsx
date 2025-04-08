// app/(dashboard)/[storeId]/(routes)/storefront/page.tsx

import StoreFront from "@/components/StoreFront";
import { getStoreData, getBillboard, getProducts } from "@/actions";
import { Store } from "@/types";

const Page = async ({ params }) => {
    const storeData: Store = await getStoreData(params.storeId);
    const billboard = await getBillboard(params.storeId);
    const products = await getProducts(params.storeId);

    return (
        <StoreFront
            initialStore={storeData} // Corrected prop name
            initialBillboard={billboard}
            initialProducts={products}
        />
    );
};

export default Page;
