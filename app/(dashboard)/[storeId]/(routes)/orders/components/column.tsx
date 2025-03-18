"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Popover, PopoverTrigger, PopoverContent } from "../../../../../../components/ui/popover";
import { Button } from "../../../../../../components/ui/button";
import { User } from "lucide-react"; // ✅ Importing Lucide React User Icon

export type OrderColumn = {
  id: string;
  phone: string;
  address: string;
  isPaid: boolean;
  totalPrice: string;
  products: string;
  createdAt: string;
  name: string;
  email: string;
  age: number;
  location: string;
  orderTime: string;
  deliveredTime: string | null;
};

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "products",
    header: "Products",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "isPaid",
    header: "Paid",
  },
  {
    accessorKey: "totalPrice",
    header: "Total Price",
  },
  {
    accessorKey: "orderTime",
    header: "Order Time",
    cell: ({ row }) => format(new Date(row.original.orderTime), "MMMM do, HH:mm"),
  },
  {
    accessorKey: "deliveredTime",
    header: "Delivered Time",
    cell: ({ row }) => row.original.deliveredTime
      ? format(new Date(row.original.deliveredTime), "MMMM do, HH:mm")
      : "Not Delivered",
  },
  {
    id: "fullInfo",
    header: "Full Info",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="m-2 md:m-0 md:mx-auto">
            <User className="w-5 h-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="center"
          sideOffset={12}  // Increased spacing between button and popover
          className="max-w-[90vw] sm:mr-[20px] md:max-w-[400px] h-auto max-h-[60vh] overflow-auto p-6 shadow-lg rounded-lg border border-gray-200 bg-white"
        >
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Order Details</h3>
            <div className="space-y-3 text-sm md:text-base">
              <p><strong className="font-medium text-gray-700">Name:</strong> <br /><span className="text-gray-600">{row.original.name}</span></p>
              <p><strong className="font-medium text-gray-700">Email:</strong> <br /><span className="text-gray-600">{row.original.email}</span></p>
              <p><strong className="font-medium text-gray-700">Age:</strong> <br /><span className="text-gray-600">{row.original.age}</span></p>
              <p><strong className="font-medium text-gray-700">Location:</strong> <br /><span className="text-gray-600">{row.original.location}</span></p>
              <p><strong className="font-medium text-gray-700">Phone:</strong> <br /><span className="text-gray-600">{row.original.phone}</span></p>
              <p><strong className="font-medium text-gray-700">Address:</strong> <br /><span className="text-gray-600">{row.original.address}</span></p>
              <p><strong className="font-medium text-gray-700">Order Time:</strong> <br /><span className="text-gray-600">{format(new Date(row.original.orderTime), "MMMM do, HH:mm:ss")}</span></p>
              <p><strong className="font-medium text-gray-700">Delivered Time:</strong> <br /><span className="text-gray-600">{row.original.deliveredTime ? format(new Date(row.original.deliveredTime), "MMMM do, HH:mm:ss") : "Not Delivered"}</span></p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    ),
  },
];
