"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { CellAction } from "./cell-actions";

export type RecentWorkColumn = {
  id: string;
  title: string;
  imageUrl: string;
  categoryName: string;
  createdAt: string;
};

export const columns: ColumnDef<RecentWorkColumn>[] = [
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: ({ row }) => (
      <div className="relative h-12 w-12 overflow-hidden rounded-md">
        <Image src={row.original.imageUrl} alt={row.original.title} fill className="object-cover" />
      </div>
    ),
  },
  { accessorKey: "title", header: "Title" },
  { accessorKey: "categoryName", header: "Category" },
  { accessorKey: "createdAt", header: "Date" },
  { id: "actions", cell: ({ row }) => <CellAction data={row.original} /> },
];
