"use client";

import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Category, RecentWork } from "@prisma/client";
import { Trash } from "lucide-react";
import { AlertModel } from "@/components/modals/alert-model";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import ImageUpload from "@/components/ui/image-upload";

const schema = z.object({ title: z.string().min(1), imageUrl: z.string().url(), categoryId: z.string().min(1) });
type Values = z.infer<typeof schema>;

export const RecentWorkForm = ({ initialData, categories }: { initialData: RecentWork | null; categories: Category[] }) => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: initialData || { title: "", imageUrl: "", categoryId: "" },
  });

  const onSubmit = async (data: Values) => {
    try {
      setLoading(true);
      if (initialData) await axios.patch(`/api/${params.storeId}/recentworks/${params.recentWorkId}`, data);
      else await axios.post(`/api/${params.storeId}/recentworks`, data);
      toast.success("Saved");
      router.push(`/${params.storeId}/recentworks`);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/recentworks/${params.recentWorkId}`);
      toast.success("Deleted");
      router.push(`/${params.storeId}/recentworks`);
      router.refresh();
    } catch {
      toast.error("Unable to delete");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (<>
    <AlertModel isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
    <div className="flex items-center justify-between">
      <Heading title={initialData ? "Edit Recent Work" : "Create Recent Work"} description="Manage recent work item" />
      {initialData && <Button variant="destructive" size="icon" onClick={() => setOpen(true)}><Trash className="h-4 w-4" /></Button>}
    </div>
    <Separator />
    <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} disabled={loading} /></FormControl><FormMessage /></FormItem>} />
      <FormField control={form.control} name="imageUrl" render={({ field }) => <FormItem><FormLabel>Image</FormLabel><FormControl><ImageUpload value={field.value} disabled={loading} onChange={field.onChange} onRemove={() => field.onChange("")} /></FormControl><FormMessage /></FormItem>} />
      <FormField control={form.control} name="categoryId" render={({ field }) => <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl><SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>} />
      <Button type="submit" disabled={loading}>Save</Button>
    </form></Form>
  </>);
};
