"use client";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import type { MeasurementRow } from "../page";
import { columns } from "./column";

export const MeasurementClient = ({ data }: { data: MeasurementRow[] }) => {
  const params = useParams(); const router = useRouter();
  return <>
    <div className="flex items-center justify-between"><Heading title={`Measurements (${data.length})`} description="Create dynamic measurement templates" />
      <Button onClick={() => router.push(`/${params.storeId}/Measurements/new`)}><Plus className="mr-2 h-4 w-4" />Add Template</Button></div>
    <Separator />
    <DataTable columns={columns} data={data} searchKey="name" />
  </>;
};
