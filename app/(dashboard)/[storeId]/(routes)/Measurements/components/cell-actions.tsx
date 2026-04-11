"use client";
import axios from "axios";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { AlertModel } from "@/components/modals/alert-model";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { MeasurementRow } from "../page";

export const CellAction = ({ data }: { data: MeasurementRow }) => {
  const params = useParams(); const router = useRouter();
  const [open,setOpen]=useState(false); const [loading,setLoading]=useState(false);
  const del = async()=>{try{setLoading(true); await axios.delete(`/api/${params.storeId}/measurements/${data.id}`); toast.success('Deleted'); router.refresh();}catch{toast.error('Failed')}finally{setLoading(false);setOpen(false)}};
  return <><AlertModel isOpen={open} onClose={()=>setOpen(false)} onConfirm={del} loading={loading}/><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuItem onClick={()=>navigator.clipboard.writeText(data.id)}><Copy className="mr-2 h-4 w-4"/>Copy ID</DropdownMenuItem><DropdownMenuItem onClick={()=>router.push(`/${params.storeId}/Measurements/${data.id}`)}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem><DropdownMenuItem onClick={()=>setOpen(true)}><Trash className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></>;
};
