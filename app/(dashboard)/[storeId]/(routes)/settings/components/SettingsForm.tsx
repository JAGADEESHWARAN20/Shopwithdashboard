"use client";

import { store } from "@prisma/client";
import * as z from 'zod'
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Trash } from "lucide-react";
import { useParams,useRouter } from "next/navigation";


import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AlertModel } from "@/components/modals/alert-model";


interface SettingsFormProps {
    initialData: store;
}

const formSchema = z.object({
  name: z.string().min(1),
});

type SettingsFormValues = z.infer<typeof formSchema>;

export const SettingsForm:React.FC<SettingsFormProps> = ({
 initialData
}) =>{
  const params = useParams();
  const router = useRouter();


  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);


  const form = useForm<SettingsFormValues>({
    resolver:zodResolver(formSchema),
    defaultValues:initialData
  });

  const onSubmit = async (data: SettingsFormValues) =>{
    try{
      setLoading(true);
      await axios.patch(`/api/stores/${params.storeId}`,data);
      router.refresh();
      toast.success(`Store Updated`);

    }catch{
      toast.error("its not working")
    }finally{
      setLoading(false);
    }
  };

  const onDelete = async () =>{
    try {
      setLoading(true);
      await axios.delete(`/api/stores/${params.storeId}`)
      router.refresh();
      router.push("/");
      toast.success("Store Deleted");
    } catch (error) {
      toast.error("Make sure you remove all products and categories first")
    } finally{
      setLoading(false)
      setOpen(false)
    }
  }

    return(
      <>
      <AlertModel 
      isOpen={open}
      onClose={()=>setOpen(false)}
      onConfirm={onDelete}
      loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading
        title="Settings"
        description="Manage Store Preferences"
        />
        <Button
        disabled={loading}
        suppressHydrationWarning={true}
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
        >
            <Trash className="h-4 w-4"/>
        </Button>
      </div>  
        <Separator/>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 w-full'>
             <div className='grid grid-cols-3 gap-8'>
                  <FormField 
                  control={form.control}
                  name="name"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input disabled={loading} placeholder='Store Name' {...field}/>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  ) }
                  />
             </div>
             <Button disabled={loading} className="ml-auto" type='submit'>
              Save Changes
             </Button>
          </form>
        </Form>
    </>
    );
}