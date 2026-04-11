"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { columns, RecentWorkColumn } from "./column";

export const RecentWorkClient = ({ data }: { data: RecentWorkColumn[] }) => {
  const router = useRouter();
  const params = useParams();
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Recent Works (${data.length})`} description="Manage portfolio highlights." />
        <Button onClick={() => router.push(`/${params.storeId}/recentworks/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} searchKey="title" />
    </>
  );
};
