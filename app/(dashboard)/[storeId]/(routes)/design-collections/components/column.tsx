"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type DesignCollectionColumn = {
  id: string;
  label: string;
  slug: string;
  isFeatured: boolean;
  createdAt: string;
};

export const columns: ColumnDef<DesignCollectionColumn>[] = [
  {
    accessorKey: "label",
    header: "Label",
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
    cell: ({ row }) => (row.original.isFeatured ? "Yes" : "No"),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  }
];