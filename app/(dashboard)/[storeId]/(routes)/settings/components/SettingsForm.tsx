"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ImagePlus, Store, Upload } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  CldUploadWidget,
  type CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

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

const getUploadUrl = (result: CloudinaryUploadWidgetResults) => {
  const info = result?.info;

  if (!info) {
    return "";
  }

  if (typeof info === "string") {
    return info.startsWith("http") ? info : "";
  }

  if ("secure_url" in info && info.secure_url) {
    return info.secure_url;
  }

  if ("url" in info && info.url) {
    return info.url;
  }

  return "";
};

const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
  const params = useParams<{ storeId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData.name,
      isActive: initialData.isActive,
      logoUrl: initialData.logoUrl || "",
      razorpayWebhookId: initialData.razorpayWebhookId || "",
    },
  });

  const logoUrl = form.watch("logoUrl");

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

  const onUpload = (result: CloudinaryUploadWidgetResults) => {
    const url = getUploadUrl(result);

    if (url) {
      form.setValue("logoUrl", url, { shouldDirty: true, shouldValidate: true });
      setImageDialogOpen(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 text-black">
          <div className="rounded-lg border bg-white p-4 shadow-sm md:p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black">Store Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="text-black placeholder:text-black/50"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex min-h-10 items-center justify-between gap-4 rounded-md border bg-muted/30 px-3 py-2 md:min-w-56">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-black" />
                      <FormLabel className="text-black">
                        {field.value ? "Active" : "Inactive"}
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        className="data-[state=checked]:bg-black/70 data-[state=unchecked]:bg-black/30"
                        disabled={loading}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="logoUrl"
            render={() => (
              <FormItem>
                <FormLabel className="text-black">Logo Preview</FormLabel>
                <FormControl>
                  <button
                    type="button"
                    className="group relative flex h-64 w-full items-center justify-center overflow-hidden rounded-lg border bg-white text-black shadow-sm transition hover:bg-black/5 md:h-80"
                    disabled={loading}
                    onClick={() => setImageDialogOpen(true)}
                  >
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt="Store logo preview"
                        fill
                        className="object-contain p-4 transition group-hover:scale-[1.01]"
                        sizes="(max-width: 768px) 100vw, 900px"
                      />
                    ) : (
                      <span className="flex flex-col items-center gap-3 text-black">
                        <ImagePlus className="h-8 w-8" />
                        Click to upload store logo
                      </span>
                    )}
                    <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-3 py-2 text-sm text-black">
                      Update image
                    </span>
                  </button>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="razorpayWebhookId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">Razorpay Webhook ID</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="text-black placeholder:text-black/50"
                    disabled={loading}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button className="bg-black/70 text-black hover:bg-black/70 hover:text-black" disabled={loading} type="submit">
            {loading ? "Updating..." : "Update settings"}
          </Button>
        </form>
      </Form>

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle className="text-black">Update store logo</DialogTitle>
            <DialogDescription className="text-black/70">
              Upload a Cloudinary image and preview it before saving the settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-lg border bg-muted/30">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Current store logo"
                  fill
                  className="object-contain p-4"
                  sizes="480px"
                />
              ) : (
                <ImagePlus className="h-10 w-10 text-black" />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "tudfiosw"}
                onSuccess={onUpload}
                options={{
                  maxFiles: 1,
                  resourceType: "image",
                  folder: "store-logos",
                }}
              >
                {({ open }) => (
                  <Button
                    className="bg-black/70 text-black hover:bg-black/70 hover:text-black"
                    disabled={loading}
                    onClick={() => open()}
                    type="button"
                  >
                    <Upload className="h-4 w-4" />
                    Upload from Cloudinary
                  </Button>
                )}
              </CldUploadWidget>
              {logoUrl ? (
                <Button
                  className="bg-black/70 text-black hover:bg-black/70 hover:text-black"
                  disabled={loading}
                  onClick={() => form.setValue("logoUrl", "", { shouldDirty: true })}
                  type="button"
                >
                  Remove image
                </Button>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SettingsForm;
