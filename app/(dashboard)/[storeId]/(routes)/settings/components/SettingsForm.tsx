"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ImageUpload from "@/components/ui/image-upload";

const schema = z.object({
  name: z.string().min(1),
  isActive: z.boolean(),
  logoUrl: z.string().optional(),
  razorpayWebhookId: z.string().optional(),
});

type Values = z.infer<typeof schema>;

interface SettingsFormProps {
  initialData: {
    name: string;
    isActive: boolean;
    logoUrl?: string | null;
    razorpayWebhookId?: string | null;
  };
}

const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
  const params = useParams<{ storeId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData.name,
      isActive: initialData.isActive,
      logoUrl: initialData.logoUrl || "",
      razorpayWebhookId: initialData.razorpayWebhookId || "",
    },
  });

  const onSubmit = async (data: Values) => {
    try {
      setLoading(true);
      await axios.patch(`/api/stores/${params.storeId}`, data);
      toast.success("Settings updated");
      router.refresh();
    } catch {
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Store Name</FormLabel><FormControl><Input {...field} disabled={loading} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="isActive" render={({ field }) => <FormItem className="flex items-center justify-between rounded border p-3"><FormLabel>Store Active</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>} />
        <FormField control={form.control} name="logoUrl" render={({ field }) => <FormItem><FormLabel>Logo</FormLabel><FormControl><ImageUpload value={field.value || ""} onChange={field.onChange} onRemove={() => field.onChange("")} disabled={loading} /></FormControl></FormItem>} />
        <FormField control={form.control} name="razorpayWebhookId" render={({ field }) => <FormItem><FormLabel>Razorpay Webhook ID</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl></FormItem>} />
        <Button type="submit" disabled={loading}>Save changes</Button>
      </form>
    </Form>
  );
};

export default SettingsForm;
