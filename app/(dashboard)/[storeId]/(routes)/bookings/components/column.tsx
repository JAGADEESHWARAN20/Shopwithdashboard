"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatter } from "@/lib/utils";

export type BookingStatusValue = "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type BookingColumn = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  region: string;
  bookingType: string;
  bookingValue: number;
  advanceAmount: number;
  appointmentDate: string | null;
  createdAt: string;
  status: BookingStatusValue;
};

const statusVariantMap: Record<BookingStatusValue, "default" | "secondary" | "destructive" | "success"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  IN_PROGRESS: "default",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

export const columns: ColumnDef<BookingColumn>[] = [
  {
    accessorKey: "customerName",
    header: "Customer",
  },
  {
    accessorKey: "customerPhone",
    header: "Phone",
  },
  {
    accessorKey: "region",
    header: "Region",
  },
  {
    accessorKey: "bookingType",
    header: "Booking Type",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariantMap[row.original.status]}>{row.original.status.replaceAll("_", " ")}</Badge>
    ),
  },
  {
    accessorKey: "bookingValue",
    header: "Booking Value",
    cell: ({ row }) => formatter.format(row.original.bookingValue),
  },
  {
    accessorKey: "advanceAmount",
    header: "Advance",
    cell: ({ row }) => formatter.format(row.original.advanceAmount),
  },
  {
    accessorKey: "appointmentDate",
    header: "Appointment",
    cell: ({ row }) =>
      row.original.appointmentDate ? format(new Date(row.original.appointmentDate), "dd MMM yyyy, hh:mm a") : "Not scheduled",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => format(new Date(row.original.createdAt), "dd MMM yyyy"),
  },
];
