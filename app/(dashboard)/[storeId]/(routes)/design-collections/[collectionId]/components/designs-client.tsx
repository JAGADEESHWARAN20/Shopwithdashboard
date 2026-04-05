"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";

import { DesignRow, designColumns } from "./design-column";

interface DesignsClientProps {
  data: DesignRow[];
}

export const DesignsClient: React.FC<DesignsClientProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Designs (${data.length})`}
          description="Manage model designs in this collection"
        />
        <Button
          onClick={() =>
            router.push(`/${params.storeId}/design-collections/${params.collectionId}/designs/new`)
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Design
        </Button>
      </div>

      <Separator />

      <DataTable<DesignRow, unknown>
        searchKey="label"
        columns={designColumns}
        data={data}
      />
    </>
  );
};
