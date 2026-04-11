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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-6xl">
        <Card className="border-0 shadow-md bg-gradient-to-b from-white to-slate-50/60 dark:from-slate-950 dark:to-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold tracking-tight">Store settings</CardTitle>
            <CardDescription>Update store identity, visibility, and integrations with a clean branded experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Store Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={loading} className="h-11 text-base bg-white dark:bg-slate-900" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="h-11 mt-6 lg:mt-0 px-4 rounded-lg border bg-white dark:bg-slate-900 flex items-center justify-between">
                    <FormLabel className="text-sm font-medium">Store Active</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-medium">Brand Logo</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value || ""}
                      onChange={field.onChange}
                      onRemove={() => field.onChange("")}
                      disabled={loading}
                      previewClassName="w-52 h-52 md:w-72 md:h-72 rounded-xl border-slate-200 shadow-sm bg-white"
                      imageClassName="object-contain p-2 bg-white"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">Use a high-resolution square logo for the best dashboard and storefront clarity.</p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="razorpayWebhookId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Razorpay Webhook ID</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} className="h-11 bg-white dark:bg-slate-900" />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="h-11 px-6">
            Save changes
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SettingsForm;
