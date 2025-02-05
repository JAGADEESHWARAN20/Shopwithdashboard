import prismadb from "@/lib/prismadb";
import React from "react";

interface DashboardPageprops{
    params:{storeId: string}
};

const DashboardPage :React.FC<DashboardPageprops> = async ({
    params
})=>{
    const store = await prismadb.store.findFirst({
        where:{
            id:params.storeId
        }
    });

    return ( 
    <>
        active store: {store?.name}
    </> 
    );
}
 
export default DashboardPage;