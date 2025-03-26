"use client";

import { Store } from "@prisma/client";
import * as z from 'zod';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import { useForm } from 'react-hook-form';
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
} from '../../../../../../components/ui/form';
import { Input } from '../../../../../../components/ui/input';
import { AlertModel } from "../../../../../../components/modals/alert-model";
import { ApiAlert } from "../../../../../../components/ui/api-alert";
import { useOrigin } from "../../../../../../hooks/use-origin";

import { useState, useEffect } from "react";
import { Switch } from "../../../../../../components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../components/ui/card";

interface SettingsFormProps {
  initialData: Store;
}

const formSchema = z.object({
  name: z.string().min(1),
});

type SettingsFormValues = z.infer<typeof formSchema>;

export const SettingsForm: React.FC<SettingsFormProps> = ({
  initialData,
}) => {
  const params = useParams();
  const router = useRouter();
  const origin = useOrigin();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(initialData.isActive || false);
  const [storeUrl, setStoreUrl] = useState(initialData.storeUrl || '');
  const [vercelUpdateLoading, setVercelUpdateLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setLoading(true);
      await axios.patch(`/api/stores/${params.storeId}`, data);
      router.refresh();
      toast.success(`Store Updated`);
    } catch {
      toast.error("its not working");
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
      toast.success("Store Deleted");
    } catch (error) {
      toast.error("Make sure you remove all products and categories first");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleToggle = async () => {
    try {
      setLoading(true);
      const response = await axios.patch(`/api/stores/${params.storeId}/activate`, {
        isActive: !isActive,
      });
      if (response.status === 200) {
        const updatedStore = response.data;
        setIsActive(updatedStore.isActive);
        setStoreUrl(updatedStore.storeUrl);
        toast.success('Store activation updated');
        router.refresh();
      } else {
        toast.error('Failed to update store activation');
      }
    } catch (error) {
      console.error('Error updating store activation:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVercelEnv = async () => {
    try {
      setVercelUpdateLoading(true);
      const response = await axios.post(`/api/stores/${params.storeId}/update-vercel-env`);
      if (response.status === 200) {
        toast.success('Vercel environment variable updated and redeployment triggered');
      } else {
        toast.error('Failed to update Vercel environment variable and trigger redeployment');
      }
    } catch (error) {
      console.error('Error updating Vercel environment variable and redeploying:', error);
      toast.error('An error occurred');
    } finally {
      setVercelUpdateLoading(false);
    }
  };

  const handlePreviewClick = () => {
    if (storeUrl) {
      setPreviewLoading(true);
      window.open(storeUrl, '_blank');
      setPreviewLoading(false);
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
        <Heading title="Settings" description="Manage Store Preferences" />
        <div className="flex items-center space-x-4">
          <Switch checked={isActive} onCheckedChange={handleToggle} />
          {isClient ? (
            <Button
              disabled={loading}
              suppressHydrationWarning={true}
              variant="destructive"
              size="sm"
              onClick={() => setOpen(true)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
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
                    <Input disabled={loading} placeholder='Store Name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button suppressHydrationWarning={true} disabled={loading} className="ml-auto" type='submit'>
            Save Changes
          </Button>
        </form>
      </Form>
      <Separator />
      {storeUrl && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Store Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative w-full aspect-video">
              <iframe
                src={storeUrl}
                className="w-full h-full border rounded-lg"
                title="Store Preview"
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Store URL: {storeUrl}</p>
              <Button
                onClick={handlePreviewClick}
                disabled={previewLoading}
              >
                {previewLoading ? 'Loading...' : 'Open in New Tab'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {storeUrl && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Store URL Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your store is accessible at: {storeUrl}
            </p>
            <Button
              disabled={vercelUpdateLoading}
              onClick={handleUpdateVercelEnv}
            >
              {vercelUpdateLoading ? 'Updating...' : 'Update Store URL'}
            </Button>
          </CardContent>
        </Card>
      )}
      <Separator />
      <ApiAlert
        title="NEXT_PUBLIC_API_URL"
        description={`${origin}/api/${params.storeId}`}
        variant="public" />
    </>
  );
};