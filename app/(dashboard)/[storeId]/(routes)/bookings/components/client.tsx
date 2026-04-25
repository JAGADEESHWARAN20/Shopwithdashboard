"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { BookingColumn, columns } from "./column";

interface BookingClientProps {
  data: BookingColumn[];
}

export function BookingClient({ data }: BookingClientProps) {
  return (
    <>
      <Heading
        title={`Bookings (${data.length})`}
        description="Review tailoring enquiries, appointments and advance payments."
      />
      <Separator />
      <DataTable<BookingColumn, unknown> searchKey="customerName" columns={columns} data={data} />
    </>
  );
}
