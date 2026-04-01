"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

import { DesignCollectionColumn, columns } from "./column";

interface Props {
  data: DesignCollectionColumn[];
}

export const DesignCollectionClient: React.FC<Props> = ({ data }) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Collections (${data.length})`}
          description="Manage your design collections"
        />
        <Button onClick={() => router.push(`/${params.storeId}/design-collections/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      <Separator />

      <DataTable<DesignCollectionColumn, unknown>
            searchKey="label"
            columns={columns}
            data={data}
            />

      <Heading title="API" description="API calls for collections" />
      <Separator />
      <ApiList entityName="design-collections" entityIdName="collectionId" />
    </>
  );
};