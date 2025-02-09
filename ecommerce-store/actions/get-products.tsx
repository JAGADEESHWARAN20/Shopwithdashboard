import { Product } from "@/types";
const URL = `${process.env.NEXT_PUBLIC_API_URL}/products`;
import qs from 'query-string'

interface Query {
     categoryId?: string;
     colorId?: string;
     sizeId?: string;
     isFeatured?: boolean;
}

const getProducts = async (query: Query): Promise<Product[]> => {
     const url = qs.stringifyUrl({
          url: URL,
          query: {
               sizeId: query.sizeId,
               colorId: query.colorId,
               categroryId: query.categoryId,
               isFeatured: query.isFeatured,
          }
     })
     const res = await fetch(URL);

     return res.json();
}

export default getProducts;

