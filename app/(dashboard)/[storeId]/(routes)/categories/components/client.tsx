"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "../../../../../../components/ui/button";
import { Heading } from "../../../../../../components/ui/heading";
import { Separator } from "../../../../../../components/ui/separator";
import { CategoryColumn, columns } from "./column";
import { DataTable } from "../../../../../../components/ui/data-table";
import { ApiList } from '../../../../../../components/ui/api-list'



interface CategoryClientProps {
    data: CategoryColumn[];
    showApi: boolean;
}

export const CategoryClient: React.FC<CategoryClientProps> = ({
    data,
    showApi,
}) => {
    const router = useRouter();
    const params = useParams();

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading
                    title={`Categories (${data.length})`}
                    description="manage billboards for your store"
                />
                <Button onClick={() => router.push(`/${params.storeId}/categories/new`)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                </Button>
            </div>
            <Separator />
            <DataTable<CategoryColumn, unknown>
  searchKey="name"
  columns={columns}
  data={data}
/>
            {showApi ? (
                <>
                    <Heading title="API" description="Api calls for Categories" />
                    <Separator />
                    <ApiList entityName="categories" entityIdName="categoryId" />
                </>
            ) : null}           

        </>
    )
} 
