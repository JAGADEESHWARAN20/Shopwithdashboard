"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";

import { DesignRow, designColumns } from "./design-column";

interface DesignGroupSummary {
  label: string;
  count: number;
}

interface DesignsClientProps {
  data: DesignRow[];
  groups: DesignGroupSummary[];
}

export const DesignsClient: React.FC<DesignsClientProps> = ({ data, groups }) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Designs (${data.length})`}
          description="Manage all design variations inside this collection"
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

      {groups.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {groups.map((group) => (
            <div key={group.label} className="rounded-full border px-3 py-1 text-sm">
              {group.label}: {group.count}
            </div>
          ))}
        </div>
      )}

      <Separator />

      <DataTable<DesignRow, unknown>
        searchKey="categoryLabel"
        columns={designColumns}
        data={data}
      />
    </>
  );
};
