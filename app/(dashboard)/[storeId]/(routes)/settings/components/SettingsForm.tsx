"use client";

import { Store } from "@prisma/client";
import * as z from 'zod';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import { useForm } from 'react-hook-form';
import { Trash, ExternalLink, RefreshCw, Globe } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../../../components/ui/card";
import { Badge } from "../../../../../../components/ui/badge";

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
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewKey, setPreviewKey] = useState(Date.now());
  const [previewError, setPreviewError] = useState(false);

  // Check if URL is valid for preview
  const isValidUrl = storeUrl &&
    (storeUrl.startsWith('http://') || storeUrl.startsWith('https://')) &&
    !storeUrl.includes('-git-main-jagadeeshwaran20s-projects.vercel.app');

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  // When form values change, update the storeUrl if needed
  useEffect(() => {
    // Only update if store is active
    if (isActive && form.getValues('name')) {
      const storeName = form.getValues('name').toLowerCase().replace(/\s+/g, '-');
      const correctUrl = `https://${storeName}.ecommercestore-online.vercel.app`;

      // Update URL if it's different from what we have
      if (storeUrl !== correctUrl && storeUrl.includes('-git-main-jagadeeshwaran20s-projects.vercel.app')) {
        setStoreUrl(correctUrl);
      }
    }
  }, [form.getValues('name'), isActive, storeUrl]);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setLoading(true);
      await axios.patch(`/api/stores/${params.storeId}`, data);

      // Update the storeUrl if needed
      if (isActive) {
        const newStoreName = data.name.toLowerCase().replace(/\s+/g, '-');
        const newStoreUrl = `https://${newStoreName}.ecommercestore-online.vercel.app`;

        if (storeUrl !== newStoreUrl) {
          setStoreUrl(newStoreUrl);

          // Also update the store URL in the database
          await handleUpdateVercelEnv();
        }
      }

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

      // Check if the current storeUrl is using the Git branch URL format or is invalid
      let needsUpdate = false;
      let currentStoreUrl = storeUrl;

      if (currentStoreUrl.includes('-git-main-jagadeeshwaran20s-projects.vercel.app') ||
        !currentStoreUrl.includes('.ecommercestore-online.vercel.app')) {
        // Extract store name and create correct URL format
        const storeName = form.getValues('name').toLowerCase().replace(/\s+/g, '-');
        currentStoreUrl = `https://${storeName}.ecommercestore-online.vercel.app`;

        // Update local state with corrected URL
        setStoreUrl(currentStoreUrl);
        needsUpdate = true;

        console.log(`Corrected store URL format to: ${currentStoreUrl}`);
      }

      const response = await axios.post(`/api/stores/${params.storeId}/update-vercel-env`);

      if (response.status === 200) {
        const { vercelResult, message } = response.data;

        // Check if the response returned a new URL
        if (response.data.updatedUrl && response.data.updatedUrl !== storeUrl) {
          setStoreUrl(response.data.updatedUrl);
          console.log(`Updated store URL from API: ${response.data.updatedUrl}`);
        }

        toast.success(message || 'Store URL successfully updated');

        // Reset the preview
        setPreviewKey(Date.now());
        setPreviewLoading(true);
        setPreviewError(false);

        if (vercelResult && !vercelResult.mocked || needsUpdate) {
          // Refresh the page to reflect the changes
          router.refresh();

          // Force a full reload after a brief delay to ensure API changes are reflected
          if (needsUpdate) {
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        }
      } else {
        toast.error('Failed to update store URL');
      }
    } catch (error: unknown) {
      console.error('Error updating store URL:', error);

      // Type guard to safely access axios error response properties
      const axiosError = error as { response?: { data?: string } };
      const errorMessage = axiosError.response?.data || 'An error occurred while updating the store URL';
      toast.error(errorMessage);
    } finally {
      setVercelUpdateLoading(false);
    }
  };

  const handlePreviewClick = () => {
    if (storeUrl) {
      window.open(storeUrl, '_blank');
    }
  };

  const handleRefreshPreview = () => {
    setPreviewKey(Date.now());
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
          <div className="flex items-center space-x-2">
            <Badge variant={isActive ? "default" : "destructive"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
            <Switch checked={isActive} onCheckedChange={handleToggle} />
          </div>
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Store Preview</CardTitle>
                <CardDescription>Live preview of your store</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleRefreshPreview}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  onClick={handlePreviewClick}
                  variant="outline"
                  size="sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full aspect-[16/9] bg-muted rounded-lg overflow-hidden">
              {storeUrl.includes('-git-main-jagadeeshwaran20s-projects.vercel.app') && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted z-10 p-4">
                  <div className="text-center">
                    <p className="text-amber-800 font-semibold mb-2">Preview unavailable with temporary URL</p>
                    <p className="text-sm text-muted-foreground mb-4">Your store URL is using a temporary format that cannot be previewed</p>
                    <Button
                      onClick={handleUpdateVercelEnv}
                      variant="outline"
                      disabled={vercelUpdateLoading}
                    >
                      {vercelUpdateLoading ? 'Updating...' : 'Update URL Format'}
                    </Button>
                  </div>
                </div>
              )}
              {previewLoading && !storeUrl.includes('-git-main-jagadeeshwaran20s-projects.vercel.app') && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              )}
              {previewError && !storeUrl.includes('-git-main-jagadeeshwaran20s-projects.vercel.app') && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted z-10 p-4">
                  <div className="text-center">
                    <p className="text-red-600 font-semibold mb-2">Failed to load preview</p>
                    <p className="text-sm text-muted-foreground mb-4">There was an error loading your store preview</p>
                    <Button onClick={handleRefreshPreview} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
              <iframe
                key={previewKey}
                src={storeUrl}
                className="w-full h-full border-0"
                style={{ minHeight: '600px' }}
                title="Store Preview"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                loading="lazy"
                referrerPolicy="no-referrer"
                onLoad={() => setPreviewLoading(false)}
                onError={() => {
                  setPreviewLoading(false);
                  setPreviewError(true);
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
      {storeUrl && (
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Store URL</CardTitle>
                <CardDescription>Your store&apos;s public URL</CardDescription>
              </div>
              <Button
                disabled={vercelUpdateLoading}
                onClick={handleUpdateVercelEnv}
                variant="outline"
              >
                <Globe className="h-4 w-4 mr-2" />
                {vercelUpdateLoading ? 'Updating...' : 'Refresh URL'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 bg-muted p-3 rounded-lg">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium break-all">{storeUrl}</p>
            </div>
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