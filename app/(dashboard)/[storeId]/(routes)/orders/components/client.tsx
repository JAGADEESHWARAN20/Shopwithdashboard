"use client";




import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { columns, OrderColumn } from "./column";
import { DataTable } from "@/components/ui/data-table";



interface OrderProps {
    data: OrderColumn[]
}

export const BillboardClient: React.FC<OrderProps> = ({
    data
}) => {

    return (
        <>
            <Heading
                title={`Orders (${data.length})`}
                description="manage billboards for your store"
            />

            <Separator />
            <DataTable SearchKey={"label"} columns={columns} data={data} />

        </>
    )
} 