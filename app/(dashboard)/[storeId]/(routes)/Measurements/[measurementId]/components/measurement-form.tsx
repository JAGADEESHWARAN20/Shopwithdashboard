"use client";
import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useFieldArray } from "react-hook-form";
import { useState } from "react";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";
import { Measurement } from "@prisma/client";
import { AlertModel } from "@/components/modals/alert-model";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const schema = z.object({
  name: z.string().min(1),
  fields: z.array(z.object({ key: z.string().min(1), label: z.string().min(1), unit: z.string().optional() })).min(1),
});
type Values = z.infer<typeof schema>;

export const MeasurementForm = ({ initialData }: { initialData: Measurement | null }) => {
  const params=useParams(); const router=useRouter();
  const [loading,setLoading]=useState(false); const [open,setOpen]=useState(false);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: initialData ? { name: initialData.name, fields: (initialData.fields as any[]) || [] } : { name: "", fields: [{ key: "chest", label: "Chest", unit: "in" }] } });
  const fieldsArray = useFieldArray({ control: form.control, name: "fields" });

  const onSubmit=async(data:Values)=>{try{setLoading(true); if(initialData) await axios.patch(`/api/${params.storeId}/measurements/${params.measurementId}`,data); else await axios.post(`/api/${params.storeId}/measurements`,data); toast.success('Saved'); router.push(`/${params.storeId}/Measurements`); router.refresh();}catch{toast.error('Something went wrong')}finally{setLoading(false)}};
  const onDelete=async()=>{try{setLoading(true); await axios.delete(`/api/${params.storeId}/measurements/${params.measurementId}`); toast.success('Deleted'); router.push(`/${params.storeId}/Measurements`); router.refresh();}catch{toast.error('Delete failed')}finally{setLoading(false);setOpen(false)}};

  return <>
    <AlertModel isOpen={open} onClose={()=>setOpen(false)} onConfirm={onDelete} loading={loading}/>
    <div className="flex items-center justify-between"><Heading title={initialData?"Edit Measurement":"Create Measurement"} description="Build a dynamic measurement template"/>{initialData&&<Button variant="destructive" size="icon" onClick={()=>setOpen(true)}><Trash className="h-4 w-4"/></Button>}</div>
    <Separator/>
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField control={form.control} name="name" render={({field})=><FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} disabled={loading}/></FormControl><FormMessage/></FormItem>}/>
      {fieldsArray.fields.map((f,index)=><div key={f.id} className="grid grid-cols-4 gap-2"><FormField control={form.control} name={`fields.${index}.key`} render={({field})=><FormItem><FormLabel>Key</FormLabel><FormControl><Input {...field}/></FormControl><FormMessage/></FormItem>}/><FormField control={form.control} name={`fields.${index}.label`} render={({field})=><FormItem><FormLabel>Label</FormLabel><FormControl><Input {...field}/></FormControl><FormMessage/></FormItem>}/><FormField control={form.control} name={`fields.${index}.unit`} render={({field})=><FormItem><FormLabel>Unit</FormLabel><FormControl><Input {...field} value={field.value || ''}/></FormControl></FormItem>}/><div className="pt-8"><Button type="button" variant="destructive" onClick={()=>fieldsArray.remove(index)} disabled={fieldsArray.fields.length===1}>Remove</Button></div></div>)}
      <Button type="button" variant="secondary" onClick={()=>fieldsArray.append({key:'',label:'',unit:'in'})}>Add Field</Button>
      <Button type="submit" disabled={loading}>Save</Button>
    </form></Form>
  </>;
};
