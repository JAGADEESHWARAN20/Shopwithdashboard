// app/(dashboard)/[storeId]/(routes)/settings/components/SettingsForm.tsx
"use client";

import { Store } from "@prisma/client";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Separator } from "../../../../../../components/ui/separator";
import { Heading } from "../../../../../../components/ui/heading";
import { Button } from "../../../../../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../../../components/ui/form";
import { Input } from "../../../../../../components/ui/input";
import { AlertModel } from "../../../../../../components/modals/alert-model";
import { ApiAlert } from "../../../../../../components/ui/api-alert";
import { useOrigin } from "../../../../../../hooks/use-origin";

const formSchema = z.object({
  name: z.string().min(1),
  storeUrl: z.string().optional(), // Add storeUrl field, optional
});

type SettingsFormValues = z.infer<typeof formSchema>;

interface SettingsFormProps {
  initialData: Store;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();
  const origin = useOrigin();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name,
      storeUrl: initialData.storeUrl || "", // Initialize with current storeUrl
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
  try {
    setLoading(true);
    await axios.patch(`/api/${params.storeId}`, data);

    // Update Vercel environment variable
    if (data.storeUrl) {
      await axios.post(`/api/${params.storeId}/update-vercel-env`, {
        storeUrl: data.storeUrl,
      });
    }

    router.refresh();
    toast.success("Store updated.");
  } catch (error) {
    toast.error("Something went wrong.");
  } finally {
    setLoading(false);
  }
  };
  
  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}`);
      router.refresh();
      router.push("/");
      toast.success("Store deleted.");
    } catch (error) {
      toast.error("Make sure you removed all products and categories first.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModel
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title="Settings" description="Manage store preferences" />
        <Button
          disabled={loading}
          variant="destructive"
          size="icon"
          onClick={() => setOpen(true)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Store name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="storeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Domain</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="e.g., mystore.com"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            Save changes
          </Button>
        </form>
      </Form>
      <Separator />
      <ApiAlert
        title="NEXT_PUBLIC_API_URL"
        description={`${origin}/api/${params.storeId}`}
        variant="public"
      />
      {initialData.storeUrl && (
        <>
          <Separator />
          <div className="space-y-2">
            <Heading title="Current Store Domain" description="Preview your store domain" />
            <p className="text-sm text-muted-foreground">
              {initialData.storeUrl}
            </p>
          </div>
        </>
      )}
    </>
  );
};