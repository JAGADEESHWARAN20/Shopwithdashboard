"use client";

import { Size } from "@prisma/client";
import * as z from 'zod'
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";


import { Separator } from "../../../../../../../components/ui/separator";
import { Heading } from "../../../../../../../components/ui/heading";
import { Button } from "../../../../../../../components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../../../../../../../components/ui/form';
import { Input } from '../../../../../../../components/ui/input';
import { AlertModel } from "../../../../../../../components/modals/alert-model";


const formSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1)
});



type SizeFormValues = z.infer<typeof formSchema>;

interface SizeFormProps {
  initialData: Size | null;
}
export const SizeForm: React.FC<SizeFormProps> = ({
  initialData,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit Size" : "Create Size";
  const description = initialData ? "Edit a Size" : "add a new Size";
  const toastMessage = initialData ? "Size Updated" : "Create Size";
  const action = initialData ? "Save changes" : "Create";


  const form = useForm<SizeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      value: ''
    }
  });

  const onSubmit = async (data: SizeFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/sizes/${params.sizeId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/sizes`, data);
      }
      router.push(`/${params.storeId}/sizes`)
      router.refresh();
      toast.success(toastMessage);
    } catch {
      toast.error("its not working")
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/sizes/${params.sizeId}`)
      router.refresh();
      router.push(`/${params.storeId}/sizes`);
      toast.success("Size Deleted");
    } catch (error) {
      toast.error("Make sure you remove all products and sizes first")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <AlertModel
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading
          title={title}
          description={description}
        />
        {initialData && (
          <Button
            disabled={loading}
            suppressHydrationWarning={true}
            variant="destructive"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 w-full'>

          <div className='grid grid-cols-3 gap-8'>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder='Size name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Value
                  </FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder='Size value' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button suppressHydrationWarning={true} disabled={loading} className="ml-auto" type='submit'>
            {action}
          </Button>
        </form>
      </Form>
      <Separator />

    </>
  );
}