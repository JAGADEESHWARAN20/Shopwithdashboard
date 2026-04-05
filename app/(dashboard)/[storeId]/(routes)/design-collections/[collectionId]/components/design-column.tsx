"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DesignCellAction } from "./design-cell-action";

export type DesignRow = {
  id: string;
  categoryLabel: string;
  variationName: string;
  imageUrl: string;
  createdAt: string;
};

export const designColumns: ColumnDef<DesignRow>[] = [
  {
    accessorKey: "categoryLabel",
    header: "Design Category",
  },
  {
    accessorKey: "variationName",
    header: "Variation",
  },
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: ({ row }) => {
      const image = row.original.imageUrl;
      return (
        <a href={image} target="_blank" rel="noreferrer" className="text-blue-600 underline">
          View
        </a>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <DesignCellAction data={row.original} />,
  },
];
