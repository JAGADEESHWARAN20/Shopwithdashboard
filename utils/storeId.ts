import prismadb from "@/lib/prismadb";

export const getStoreId = async (): Promise<string | null> => {
     try {
          const hostname = process.env.VERCEL_URL || "localhost:3000";
          const subdomain = hostname.split("-")[0];

          if (!subdomain || subdomain === "localhost:3000") {
               const store = await prismadb.store.findFirst();
               return store?.id || null;
          }

          const storeName = subdomain.replace(/-/g, " ").trim().replace(/\s+/g, " ");
          const store = await prismadb.store.findFirst({
               where: {
                    name: {
                         equals: storeName,
                         mode: "insensitive",
                    },
                    isActive: true,
               },
          });

          return store?.id || null;
     } catch (error) {
          console.error("[GET_STORE_ID]", error);
          return null;
     }
};