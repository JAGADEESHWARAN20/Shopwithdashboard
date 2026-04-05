"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DesignCellAction } from "./design-cell-action";

export type DesignRow = {
  id: string;
  categoryLabel: string;
  previewImage: string;
  variationCount: number;
  createdAt: string;
};

export const designColumns: ColumnDef<DesignRow>[] = [
  {
    accessorKey: "categoryLabel",
    header: "Design Group",
  },
  {
    accessorKey: "variationCount",
    header: "Variations",
  },
  {
    accessorKey: "previewImage",
    header: "Preview",
    cell: ({ row }) => {
      const image = row.original.previewImage;
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
