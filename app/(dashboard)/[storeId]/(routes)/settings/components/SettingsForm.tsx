"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import * as z from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "@/components/ui/image-upload";

const schema = z.object({
  name: z.string().min(1),
  isActive: z.boolean(),
  storeUrl: z.string().optional(),
  alternateUrls: z.array(z.object({ value: z.string().min(1) })),
  logoUrl: z.string().optional(),
  razorpayWebhookId: z.string().optional(),
});

type Values = z.infer<typeof schema>;

interface SettingsFormProps {
  initialData: {
    name: string;
    isActive: boolean;
    storeUrl: string | null;
    alternateUrls: string[];
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
      storeUrl: initialData.storeUrl || "",
      alternateUrls: (initialData.alternateUrls || []).map((value) => ({ value })),
      logoUrl: initialData.logoUrl || "",
      razorpayWebhookId: initialData.razorpayWebhookId || "",
    },
  });

  const alt = useFieldArray({ control: form.control, name: "alternateUrls" });

  const onSubmit = async (data: Values) => {
    try {
      setLoading(true);
      await axios.patch(`/api/stores/${params.storeId}`, {
        ...data,
        alternateUrls: data.alternateUrls.map((u) => u.value),
      });
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
        <FormField control={form.control} name="storeUrl" render={({ field }) => <FormItem><FormLabel>Custom domain (storeUrl)</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl></FormItem>} />
        <div className="space-y-2"><FormLabel>Alternate URLs</FormLabel>{alt.fields.map((f, i) => <div key={f.id} className="flex gap-2"><FormField control={form.control} name={`alternateUrls.${i}.value`} render={({ field }) => <FormItem className="flex-1"><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} /><Button type="button" variant="destructive" onClick={() => alt.remove(i)}>Remove</Button></div>)}<Button type="button" variant="secondary" onClick={() => alt.append({ value: "" })}>Add URL</Button></div>
        <FormField control={form.control} name="razorpayWebhookId" render={({ field }) => <FormItem><FormLabel>Razorpay Webhook ID</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl></FormItem>} />
        <Button type="submit" disabled={loading}>Save changes</Button>
      </form>
    </Form>
  );
};

export default SettingsForm;
