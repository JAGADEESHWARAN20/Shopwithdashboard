"use client";




import { Heading } from "../../../../../../components/ui/heading";
import { Separator } from "../../../../../../components/ui/separator";
import { columns, OrderColumn } from "./column";
import { DataTable } from "../../../../../../components/ui/data-table";



interface OrderClientProps {
    data: OrderColumn[]
}

export const OrderClient: React.FC<OrderClientProps> = ({
    data
}) => {

    return (
        <>
            <Heading
                title={`Orders (${data.length})`}
                description="manage billboards for your store"
            />

            <Separator />
            <DataTable SearchKey={"products"} columns={columns} data={data} />

        </>
    )
} 