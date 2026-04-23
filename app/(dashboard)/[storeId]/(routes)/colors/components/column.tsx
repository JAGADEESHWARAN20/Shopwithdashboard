"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-actions";

export type ColorColumn = {
  id: string
  name: string
  value: string
  createdAt: string;

}

export const columns: ColumnDef<ColorColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.value}
        <svg
          aria-hidden="true"
          className="h-6 w-6 rounded-full border"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="11" fill={row.original.value} />
        </svg>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  }
]
