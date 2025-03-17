import { Product } from "@/types";
import qs from 'query-string'
const URL = `${process.env.NEXT_PUBLIC_API_URL}/products`;

interface Query {
     categoryId?: string;
     colorId?: string;
     sizeId?: string;
     isFeatured?: boolean;
}

const getProducts = async (query: Query): Promise<Product[]> => {
     const concurrecyQuery = await query;
     const url = qs.stringifyUrl({
          url: URL,
          query: {
               sizeId: concurrecyQuery.sizeId,
               colorId: concurrecyQuery.colorId,
               categoryId: concurrecyQuery.categoryId,
               isFeatured: concurrecyQuery.isFeatured,
          }
     })
     const res = await fetch(url);

     return res.json();
}

export default getProducts;

