// "use client";

// import * as z from 'zod';
// import axios from 'axios';
// import { zodResolver } from '@hookform/resolvers/zod';
// import toast from 'react-hot-toast';
// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { Trash } from "lucide-react";
// import { useParams, useRouter } from "next/navigation";

// import { Separator } from "@/components/ui/separator";
// import { Heading } from "@/components/ui/heading";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage
// } from '@/components/ui/form';
// import { Input } from '@/components/ui/input';
// import { AlertModel } from "@/components/modals/alert-model";
// import ImageUpload from "@/components/ui/image-upload";

// const formSchema = z.object({
//   label: z.string().min(1),
//   imageUrl: z.string().min(1)
// });

// type BillboardFormValues = z.infer<typeof formSchema>;

// interface BillboardFormProps {
//   // Use 'any' or a partial type to avoid the 'missing categories/store' error
//   initialData: any | null; 
// }

// export const BillboardForm: React.FC<BillboardFormProps> = ({
//   initialData
// }) => {
//   const params = useParams();
//   const router = useRouter();

//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const title = initialData ? "Edit billboard" : "Create billboard";
//   const description = initialData ? "Edit a billboard" : "Add a new billboard";
//   const toastMessage = initialData ? "Billboard updated." : "Billboard created.";
//   const action = initialData ? "Save changes" : "Create";

//   const form = useForm<BillboardFormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: initialData || {
//       label: '',
//       imageUrl: ''
//     }
//   });

//   const onSubmit = async (data: BillboardFormValues) => {
//     try {
//       setLoading(true);
//       if (initialData) {
//         await axios.patch(`/api/${params.storeId}/billboards/${params.billboardId}`, data);
//       } else {
//         await axios.post(`/api/${params.storeId}/billboards`, data);
//       }
//       router.refresh();
//       router.push(`/${params.storeId}/billboards`);
//       toast.success(toastMessage);
//     } catch (error) {
//       toast.error("Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <AlertModel 
//         isOpen={open} 
//         onClose={() => setOpen(false)} 
//         onConfirm={() => {}} // Add your delete function here
//         loading={loading} 
//       />
//       <div className="flex items-center justify-between">
//         <Heading title={title} description={description} />
//         {initialData && (
//           <Button
//             disabled={loading}
//             variant="destructive"
//             size="icon"
//             onClick={() => setOpen(true)}
//           >
//             <Trash className="h-4 w-4" />
//           </Button>
//         )}
//       </div>
//       <Separator />
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
//           <FormField
//             control={form.control}
//             name="imageUrl"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Background Image</FormLabel>
//                 <FormControl>
//                   <ImageUpload 
//                     // FIX: Ensure 'value' is always an array of strings
//                     value={field.value } 
//                     disabled={loading} 
//                     onChange={(url) => field.onChange(url)} 
//                     onRemove={() => field.onChange("")} 
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <div className="grid grid-cols-3 gap-8">
//             <FormField
//               control={form.control}
//               name="label"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Label</FormLabel>
//                   <FormControl>
//                     <Input disabled={loading} placeholder="Billboard label" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>
//           <Button disabled={loading} className="ml-auto" type="submit">
//             {action}
//           </Button>
//         </form>
//       </Form>
//     </>
//   );
// }

"use client";

import * as z from 'zod';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AlertModel } from "@/components/modals/alert-model";

import ImageUpload from "@/components/ui/image-upload"; 

const formSchema = z.object({
  label: z.string().min(1),
  imageUrl: z.string().min(1) // We keep the variable name imageUrl to match the database
});

type BillboardFormValues = z.infer<typeof formSchema>;

interface BillboardFormProps {
  initialData: any | null; 
}

export const BillboardForm: React.FC<BillboardFormProps> = ({
  initialData
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit billboard" : "Create billboard";
  const description = initialData ? "Edit a billboard" : "Add a new billboard";
  const toastMessage = initialData ? "Billboard updated." : "Billboard created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<BillboardFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      label: '',
      imageUrl: '' // still pointing to the database string field
    }
  });

  const onSubmit = async (data: BillboardFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/billboards/${params.billboardId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/billboards`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/billboards`);
      toast.success(toastMessage);
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModel 
        isOpen={open} 
        onClose={() => setOpen(false)} 
        onConfirm={async () => {
          try {
            setLoading(true);
            await axios.delete(`/api/${params.storeId}/billboards/${params.billboardId}`);
            router.refresh();
            router.push(`/${params.storeId}/billboards`);
            toast.success("Billboard deleted.");
          } catch (error) {
            toast.error("Make sure you removed all categories using this billboard first.");
          } finally {
            setLoading(false);
            setOpen(false);
          }
        }} 
        loading={loading} 
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <FormField
            control={form.control}
            name="imageUrl" // We keep this name so the API receives it correctly
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background Image</FormLabel>
                <FormControl>
                  <ImageUpload 
                    value={field.value} 
                    disabled={loading} 
                    onChange={(url) => field.onChange(url)} 
                    onRemove={() => field.onChange("")} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Billboard label" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
}