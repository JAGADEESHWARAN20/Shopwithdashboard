"use client";

import { Store } from "@prisma/client";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Trash, Rocket } from "lucide-react";
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
import { Switch } from "../../../../../../components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../components/ui/card";
import { Badge } from "../../../../../../components/ui/badge";

const formSchema = z.object({
  name: z.string().min(1),
  storeUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

type SettingsFormValues = z.infer<typeof formSchema>;

interface SettingsFormProps {
  initialData: Store & { storeUrl?: string | null; isActive?: boolean };
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();
  const origin = useOrigin();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name || "",
      storeUrl: initialData.storeUrl || "",
      isActive: initialData.isActive ?? true,
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setLoading(true);
      await axios.patch(`/api/stores/${params.storeId}`, data);
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
      await axios.delete(`/api/stores/${params.storeId}`);
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

  const onDeploy = async () => {
    try {
      setDeploying(true);
      // Simulate a deployment API call (replace with actual Vercel deployment API call)
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate 2-second deployment
      toast.success("Frontend website deployed successfully.");
    } catch (error) {
      toast.error("Failed to deploy frontend website.");
    } finally {
      setDeploying(false);
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
      <div className="space-y-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Settings Header and Switcher */}
          <Card className="col-span-1 md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Settings</CardTitle>
                <p className="text-sm text-muted-foreground">Manage store preferences</p>
              </div>
              <Form {...form}>
                <form>
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3">
                        <FormLabel>Active</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={loading}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardHeader>
          </Card>

          {/* Delete Button */}
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Delete Store</CardTitle>
              <Button
                disabled={loading}
                variant="destructive"
                size="icon"
                onClick={() => setOpen(true)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </CardHeader>
          </Card>

          {/* Store Name Text Field */}
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Store Name</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  <Button disabled={loading} type="submit">
                    Save changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* NEXT_PUBLIC_API_URL */}
          <Card className="col-span-1 md:col-span-3">
            <CardHeader>
              <CardTitle>API URL</CardTitle>
            </CardHeader>
            <CardContent>
              <ApiAlert
                title="NEXT_PUBLIC_API_URL"
                description={`<span class="math-inline">\{origin\}/api/</span>{params.storeId}`}
                variant="public"
              />
            </CardContent>
          </Card>

          {/* Domain Status and Deploy Button */}
          <Card className="col-span-1 md:col-span-1">
            <CardHeader>
              <CardTitle>Store Domain Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                {/* In SettingsForm.tsx (around line 210) */}
                <Badge variant={initialData.isActive ? "success" : "destructive"}>
                  {initialData.isActive ? "Active" : "Inactive"}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {initialData.storeUrl || "No domain set"}
                </p>
              </div>
              <Button
                disabled={deploying || !initialData.storeUrl}
                onClick={onDeploy}
                className="w-full"
              >
                <Rocket className="mr-2 h-4 w-4" />
                {deploying ? "Deploying..." : "Deploy Frontend"}
              </Button>
            </CardContent>
          </Card>

          {/* Iframe Previewer */}
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Frontend Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {initialData.storeUrl ? (
                <iframe
                  src={initialData.storeUrl}
                  className="w-full h-96 border rounded-md"
                  title="Frontend Preview"
                  sandbox="allow-same-origin allow-scripts"
                />
              ) : (
                <p className="text-sm text-muted-foreground">No domain set to preview.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};