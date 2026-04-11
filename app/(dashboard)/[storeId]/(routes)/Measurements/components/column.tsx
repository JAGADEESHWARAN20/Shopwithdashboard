"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-actions";
import type { MeasurementRow } from "../page";

export const columns: ColumnDef<MeasurementRow>[] = [
  { accessorKey: "name", header: "Template Name" },
  { accessorKey: "fieldCount", header: "Fields" },
  { accessorKey: "createdAt", header: "Created" },
  { id: "actions", cell: ({ row }) => <CellAction data={row.original} /> },
];
