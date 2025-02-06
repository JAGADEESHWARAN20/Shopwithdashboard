"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ColorColumn, columns } from "./column";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from '@/components/ui/api-list'



interface ColorsClientProps {
    data: ColorColumn[]
}

export const ColorClient: React.FC<ColorsClientProps> = ({
    data
}) => {
    const router = useRouter();
    const params = useParams();

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading
                    title={`Colors (${data.length})`}
                    description="manage colors of products for your store"
                />
                <Button onClick={() => router.push(`/${params.storeId}/colors/new`)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                </Button>
            </div>
            <Separator />
            <DataTable SearchKey={"name"} columns={columns} data={data} />
            <Heading title="API" description="Api calls for colors" />
            <Separator />
            <ApiList entityName="colors" entityIdName="colorId" />

        </>
    )
} 