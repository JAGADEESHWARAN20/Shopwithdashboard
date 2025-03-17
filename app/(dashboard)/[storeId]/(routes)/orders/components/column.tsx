"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

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
    cell: ({ row }) => row.original.deliveredTime ? format(new Date(row.original.deliveredTime), "MMMM do,дак, HH:mm") : "Not Delivered",
  },
  {
    id: "fullInfo",
    header: "Full Info",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 00-1.57-.429m1.57.429v5.25m12-4.875a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
            </svg>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] h-[400px] overflow-x-hidden m-[30px]">
          <div className="space-y-4 p-4 ">
            <h3 className="text-lg font-semibold text-gray-800">Order Details</h3>
            <div className="space-y-2">
              <p><strong className="font-medium text-gray-700">Name:</strong> <br /><span className="text-gray-600">{row.original.name}</span></p>
              <p><strong className="font-medium text-gray-700">Email:</strong> <br /><span className="text-gray-600">{row.original.email}</span></p>
              <p><strong className="font-medium text-gray-700">Age:</strong> <br /> <span className="text-gray-600">{row.original.age}</span></p>
              <p><strong className="font-medium text-gray-700">Location:</strong> <br /><span className="text-gray-600">{row.original.location}</span></p>
              <p><strong className="font-medium text-gray-700">Phone:</strong> <br /> <span className="text-gray-600">{row.original.phone}</span></p>
              <p><strong className="font-medium text-gray-700">Address:</strong> <br /><span className="text-gray-600">{row.original.address}</span></p>
              <p><strong className="font-medium text-gray-700">Order Time:</strong><br /> <span className="text-gray-600">{format(new Date(row.original.orderTime), "MMMM do, HH:mm:ss")}</span></p>
              <p><strong className="font-medium text-gray-700">Delivered Time:</strong> <br /><span className="text-gray-600">{row.original.deliveredTime ? format(new Date(row.original.deliveredTime), "MMMM do,дак, HH:mm:ss") : "Not Delivered"}</span></p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    ),
  },
];